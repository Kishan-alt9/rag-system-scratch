"""Transactional migration of persisted RAG metadata and text chunks to PostgreSQL."""

from __future__ import annotations

import hashlib
import json
import pickle
from collections import defaultdict
from pathlib import Path
from typing import Any

import faiss
import fitz
import numpy as np
import psycopg2

from src.database import Database


class MigrationError(ValueError):
    """Raised when source artifacts are inconsistent or migration validation fails."""


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for data in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(data)
    return digest.hexdigest()


def _load_source(storage_dir: Path, data_dir: Path) -> dict[str, Any]:
    metadata_path = storage_dir / "metadata.json"
    chunks_path = storage_dir / "chunks.pkl"
    embeddings_path = storage_dir / "embeddings.pkl"
    index_path = storage_dir / "faiss.index"

    try:
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        with chunks_path.open("rb") as source:
            chunks = pickle.load(source)
        with embeddings_path.open("rb") as source:
            embeddings = pickle.load(source)
        index = faiss.read_index(str(index_path))
    except (OSError, json.JSONDecodeError, pickle.PickleError, RuntimeError) as error:
        raise MigrationError(f"Unable to read migration source artifacts: {error}") from error

    if not isinstance(metadata, dict) or not isinstance(metadata.get("documents"), list):
        raise MigrationError("metadata.json must contain a documents list")
    if not isinstance(chunks, list):
        raise MigrationError("chunks.pkl must contain a list")
    if not isinstance(embeddings, np.ndarray) or embeddings.ndim != 2:
        raise MigrationError("embeddings.pkl must contain a two-dimensional NumPy array")
    if len(chunks) != len(embeddings) or len(chunks) != index.ntotal:
        raise MigrationError(
            "FAISS source counts do not match: "
            f"chunks={len(chunks)}, embeddings={len(embeddings)}, faiss={index.ntotal}"
        )
    if embeddings.shape[1] != index.d:
        raise MigrationError(
            f"Embedding dimension mismatch: embeddings={embeddings.shape[1]}, faiss={index.d}"
        )

    chunks_by_document: dict[str, list[tuple[int, dict[str, Any], int]]] = defaultdict(list)
    page_orders: dict[tuple[str, int], int] = defaultdict(int)
    for sequence, chunk in enumerate(chunks):
        if not isinstance(chunk, dict):
            raise MigrationError(f"Chunk at FAISS position {sequence} is not an object")
        required = {"document", "page", "text", "chunk_id"}
        if not required <= chunk.keys():
            raise MigrationError(
                f"Chunk at FAISS position {sequence} is missing "
                f"{sorted(required - chunk.keys())}"
            )
        document = chunk["document"]
        page = chunk["page"]
        if not isinstance(document, str) or not isinstance(page, int) or page < 1:
            raise MigrationError(f"Invalid document/page at FAISS position {sequence}")
        if not isinstance(chunk["text"], str) or not isinstance(chunk["chunk_id"], str):
            raise MigrationError(f"Invalid text or chunk_id at FAISS position {sequence}")
        doc_order = page_orders[(document, page)]
        expected_chunk_id = f"{document}:{page}:{doc_order}"
        if chunk["chunk_id"] != expected_chunk_id:
            raise MigrationError(
                f"Chunk identity mismatch at FAISS position {sequence}: "
                f"expected {expected_chunk_id}, got {chunk['chunk_id']}"
            )
        page_orders[(document, page)] += 1
        chunks_by_document[document].append((sequence, chunk, doc_order))

    documents = metadata["documents"]
    metadata_by_filename: dict[str, dict[str, Any]] = {}
    for document in documents:
        if not isinstance(document, dict):
            raise MigrationError("Each metadata document must be an object")
        filename = document.get("filename")
        if not isinstance(filename, str) or filename in metadata_by_filename:
            raise MigrationError(f"Invalid or duplicate metadata filename: {filename!r}")
        metadata_by_filename[filename] = document

    if set(metadata_by_filename) != set(chunks_by_document):
        raise MigrationError(
            "Metadata and chunk documents differ: "
            f"metadata={sorted(metadata_by_filename)}, chunks={sorted(chunks_by_document)}"
        )

    verified: list[dict[str, Any]] = []
    for filename, document in metadata_by_filename.items():
        pdf_path = data_dir / filename
        if not pdf_path.is_file():
            raise MigrationError(f"Missing PDF for document {filename}: {pdf_path}")
        actual_sha256 = _sha256(pdf_path)
        if actual_sha256 != document.get("sha256"):
            raise MigrationError(
                f"SHA256 mismatch for document {filename}: "
                f"metadata={document.get('sha256')}, actual={actual_sha256}"
            )
        try:
            with fitz.open(pdf_path) as pdf:
                page_count = pdf.page_count
        except (OSError, RuntimeError) as error:
            raise MigrationError(f"Unable to open PDF for document {filename}: {error}") from error
        if page_count != document.get("page_count"):
            raise MigrationError(
                f"Page-count mismatch for document {filename}: "
                f"metadata={document.get('page_count')}, actual={page_count}"
            )
        document_chunks = chunks_by_document[filename]
        if len(document_chunks) != document.get("chunk_count"):
            raise MigrationError(
                f"Chunk-count mismatch for document {filename}: "
                f"metadata={document.get('chunk_count')}, actual={len(document_chunks)}"
            )
        if document.get("id") != document.get("sha256"):
            raise MigrationError(f"Metadata ID is not the SHA256 identity for document {filename}")
        verified.append({
            "metadata": document,
            "filename": filename,
            "pdf_path": pdf_path,
            "page_count": page_count,
            "chunks": document_chunks,
        })

    return {"documents": verified, "chunk_count": len(chunks), "index_count": index.ntotal}


def _document_id(cursor: Any, record: dict[str, Any]) -> Any:
    metadata = record["metadata"]
    filename = record["filename"]
    file_path = str(record["pdf_path"])
    cursor.execute(
        """
        SELECT id, filename, sha256, page_count, status, file_path
        FROM documents WHERE sha256 = %s FOR UPDATE
        """,
        (metadata["sha256"],),
    )
    existing = cursor.fetchone()
    if existing:
        expected = (filename, metadata["sha256"], record["page_count"], metadata["status"], file_path)
        actual = tuple(existing[field] for field in ("filename", "sha256", "page_count", "status", "file_path"))
        if actual != expected:
            raise MigrationError(f"Existing document does not match verified source: {filename}")
        return existing["id"]

    cursor.execute(
        """
        INSERT INTO documents (filename, sha256, page_count, block_count, status, file_path)
        VALUES (%s, %s, %s, %s, %s, %s) RETURNING id
        """,
        (filename, metadata["sha256"], record["page_count"], metadata["chunk_count"], metadata["status"], file_path),
    )
    return cursor.fetchone()["id"]


def _page_id(cursor: Any, document_id: Any, page_number: int) -> Any:
    cursor.execute(
        "SELECT id FROM pages WHERE document_id = %s AND page_number = %s FOR UPDATE",
        (document_id, page_number),
    )
    existing = cursor.fetchone()
    if existing:
        return existing["id"]
    cursor.execute(
        "INSERT INTO pages (document_id, page_number) VALUES (%s, %s) RETURNING id",
        (document_id, page_number),
    )
    return cursor.fetchone()["id"]


def _migrate_block(cursor: Any, page_id: Any, sequence: int, chunk: dict[str, Any], doc_order: int) -> None:
    cursor.execute(
        """
        SELECT id, block_type, content_text, table_structure, bounding_box,
               artifact_path, faiss_sequence, doc_order
        FROM blocks WHERE page_id = %s AND doc_order = %s FOR UPDATE
        """,
        (page_id, doc_order),
    )
    existing = cursor.fetchone()
    if existing:
        expected = ("text", chunk["text"], None, None, None, sequence, doc_order)
        actual = tuple(existing[field] for field in (
            "block_type", "content_text", "table_structure", "bounding_box",
            "artifact_path", "faiss_sequence", "doc_order",
        ))
        if actual != expected:
            raise MigrationError(
                f"Existing block does not match FAISS position {sequence} "
                f"for chunk {chunk['chunk_id']}"
            )
        return

    cursor.execute(
        """
        INSERT INTO blocks
            (page_id, block_type, content_text, table_structure,
             bounding_box, artifact_path, faiss_sequence, doc_order)
        VALUES (%s, 'text', %s, NULL, NULL, NULL, %s, %s)
        """,
        (page_id, chunk["text"], sequence, doc_order),
    )


def migrate_to_database(
    connection_string: str,
    storage_dir: Path | str = Path("storage"),
    data_dir: Path | str = Path("data/raw"),
    schema: str | None = None,
) -> dict[str, int]:
    """Validate source artifacts and idempotently migrate them in one transaction."""
    source = _load_source(Path(storage_dir), Path(data_dir))
    expected_documents = len(source["documents"])
    expected_pages = sum(record["page_count"] for record in source["documents"])
    expected_blocks = source["chunk_count"]
    database = Database(connection_string, schema=schema)
    try:
        with database.transaction() as cursor:
            for record in source["documents"]:
                document_id = _document_id(cursor, record)
                page_ids = {
                    page_number: _page_id(cursor, document_id, page_number)
                    for page_number in range(1, record["page_count"] + 1)
                }
                for sequence, chunk, doc_order in record["chunks"]:
                    page_id = page_ids[chunk["page"]]
                    _migrate_block(cursor, page_id, sequence, chunk, doc_order)
                cursor.execute(
                    """
                    UPDATE documents
                    SET block_count = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    """,
                    (record["metadata"]["chunk_count"], document_id),
                )

            cursor.execute("SELECT COUNT(*) AS count FROM documents")
            document_count = cursor.fetchone()["count"]
            cursor.execute("SELECT COUNT(*) AS count FROM pages")
            page_count = cursor.fetchone()["count"]
            cursor.execute("SELECT COUNT(*) AS count FROM blocks")
            block_count = cursor.fetchone()["count"]
            cursor.execute("SELECT COUNT(*) AS count, MIN(faiss_sequence) AS minimum, MAX(faiss_sequence) AS maximum FROM blocks")
            sequence_stats = cursor.fetchone()
            if (document_count, page_count, block_count) != (
                expected_documents, expected_pages, expected_blocks
            ):
                raise MigrationError(
                    "Migration count validation failed: "
                    f"documents={document_count}, pages={page_count}, blocks={block_count}"
                )
            if (sequence_stats["count"], sequence_stats["minimum"], sequence_stats["maximum"]) != (
                expected_blocks, 0, expected_blocks - 1
            ):
                raise MigrationError("Migration FAISS sequence range validation failed")
            cursor.execute("SELECT COUNT(DISTINCT faiss_sequence) AS count FROM blocks")
            if cursor.fetchone()["count"] != expected_blocks:
                raise MigrationError("Migration FAISS sequences are not unique")
    except (psycopg2.Error, KeyError, TypeError) as error:
        if isinstance(error, MigrationError):
            raise
        raise MigrationError(f"Database migration failed and was rolled back: {error}") from error
    finally:
        database.close()

    return {
        "documents": expected_documents,
        "pages": expected_pages,
        "blocks": expected_blocks,
        "faiss_sequences": expected_blocks,
    }


if __name__ == "__main__":
    import os

    result = migrate_to_database(os.environ["DATABASE_URL"])
    print(result)
