import hashlib
import json
import pickle
from pathlib import Path

import faiss
import fitz
import numpy as np
import pytest

from src.migrate_to_db import MigrationError, migrate_to_database


def _make_source(root: Path):
    storage_dir = root / "storage"
    data_dir = root / "data" / "raw"
    storage_dir.mkdir(parents=True)
    data_dir.mkdir(parents=True)

    specifications = {
        "alpha.pdf": [["alpha page one"], [], ["alpha page three first", "alpha page three second"]],
        "beta.pdf": [["beta page one"], ["beta page two"]],
    }
    metadata_documents = []
    chunks = []
    for filename, pages in specifications.items():
        pdf_path = data_dir / filename
        pdf = fitz.open()
        for page_chunks in pages:
            page = pdf.new_page()
            if page_chunks:
                page.insert_text((72, 72), " ".join(page_chunks))
        pdf.save(pdf_path)
        pdf.close()

        file_hash = hashlib.sha256(pdf_path.read_bytes()).hexdigest()
        document_chunks = []
        for page_number, page_chunks in enumerate(pages, start=1):
            for text in page_chunks:
                document_chunks.append({
                    "document": filename,
                    "page": page_number,
                    "text": text,
                    "chunk_id": f"{filename}:{page_number}:{len([c for c in document_chunks if c['page'] == page_number])}",
                })
        chunks.extend(document_chunks)
        metadata_documents.append({
            "id": file_hash,
            "filename": filename,
            "sha256": file_hash,
            "page_count": len(pages),
            "chunk_count": len(document_chunks),
            "status": "indexed",
        })

    embeddings = np.arange(len(chunks) * 2, dtype="float32").reshape(len(chunks), 2)
    index = faiss.IndexFlatL2(2)
    index.add(embeddings)
    (storage_dir / "metadata.json").write_text(
        json.dumps({"documents": metadata_documents}, indent=2), encoding="utf-8"
    )
    with (storage_dir / "chunks.pkl").open("wb") as source:
        pickle.dump(chunks, source)
    with (storage_dir / "embeddings.pkl").open("wb") as source:
        pickle.dump(embeddings, source)
    faiss.write_index(index, str(storage_dir / "faiss.index"))
    return storage_dir, data_dir, metadata_documents, chunks


def _run(db, storage_dir, data_dir):
    return migrate_to_database(
        db.connection_string,
        storage_dir=storage_dir,
        data_dir=data_dir,
        schema=db.schema,
    )


def _metadata_path(storage_dir):
    return storage_dir / "metadata.json"


def test_successful_migration_maps_pages_blocks_and_faiss_positions(db, tmp_path):
    storage_dir, data_dir, metadata, chunks = _make_source(tmp_path)
    source_bytes = {
        path: path.read_bytes()
        for path in [
            _metadata_path(storage_dir),
            storage_dir / "chunks.pkl",
            storage_dir / "embeddings.pkl",
            storage_dir / "faiss.index",
        ]
    }

    assert _run(db, storage_dir, data_dir) == {
        "documents": 2, "pages": 5, "blocks": 5, "faiss_sequences": 5,
    }
    with db.transaction() as cursor:
        cursor.execute("SELECT filename, page_count, block_count FROM documents ORDER BY filename")
        assert [tuple(row.values()) for row in cursor] == [
            ("alpha.pdf", 3, 3), ("beta.pdf", 2, 2)
        ]
        cursor.execute(
            """
            SELECT d.filename, p.page_number, b.content_text, b.faiss_sequence, b.doc_order
            FROM documents d JOIN pages p ON p.document_id = d.id
            LEFT JOIN blocks b ON b.page_id = p.id
            ORDER BY d.filename, p.page_number, b.doc_order NULLS FIRST
            """
        )
        rows = [tuple(row.values()) for row in cursor]
        cursor.execute(
            """
            SELECT b.faiss_sequence, d.filename, p.page_number, b.content_text
            FROM documents d
            JOIN pages p ON p.document_id = d.id
            JOIN blocks b ON b.page_id = p.id
            ORDER BY b.faiss_sequence
            """
        )
        faiss_rows = [tuple(row.values()) for row in cursor]

    assert rows == [
        ("alpha.pdf", 1, "alpha page one", 0, 0),
        ("alpha.pdf", 2, None, None, None),
        ("alpha.pdf", 3, "alpha page three first", 1, 0),
        ("alpha.pdf", 3, "alpha page three second", 2, 1),
        ("beta.pdf", 1, "beta page one", 3, 0),
        ("beta.pdf", 2, "beta page two", 4, 0),
    ]
    assert [row[0] for row in faiss_rows] == [0, 1, 2, 3, 4]
    assert faiss_rows == [
        (0, "alpha.pdf", 1, "alpha page one"),
        (1, "alpha.pdf", 3, "alpha page three first"),
        (2, "alpha.pdf", 3, "alpha page three second"),
        (3, "beta.pdf", 1, "beta page one"),
        (4, "beta.pdf", 2, "beta page two"),
    ]
    assert all(path.read_bytes() == content for path, content in source_bytes.items())


def test_sha256_mismatch_rejected(db, tmp_path):
    storage_dir, data_dir, _, _ = _make_source(tmp_path)
    metadata_path = _metadata_path(storage_dir)
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    metadata["documents"][0]["sha256"] = "0" * 64
    metadata_path.write_text(json.dumps(metadata), encoding="utf-8")
    with pytest.raises(MigrationError, match="SHA256 mismatch.*alpha.pdf"):
        _run(db, storage_dir, data_dir)


def test_missing_pdf_rejected(db, tmp_path):
    storage_dir, data_dir, _, _ = _make_source(tmp_path)
    (data_dir / "alpha.pdf").unlink()
    with pytest.raises(MigrationError, match="Missing PDF.*alpha.pdf"):
        _run(db, storage_dir, data_dir)


def test_page_count_mismatch_rejected(db, tmp_path):
    storage_dir, data_dir, _, _ = _make_source(tmp_path)
    metadata_path = _metadata_path(storage_dir)
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    metadata["documents"][0]["page_count"] = 4
    metadata_path.write_text(json.dumps(metadata), encoding="utf-8")
    with pytest.raises(MigrationError, match="Page-count mismatch.*alpha.pdf"):
        _run(db, storage_dir, data_dir)


def test_chunk_count_mismatch_rejected(db, tmp_path):
    storage_dir, data_dir, _, _ = _make_source(tmp_path)
    metadata_path = _metadata_path(storage_dir)
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    metadata["documents"][0]["chunk_count"] = 99
    metadata_path.write_text(json.dumps(metadata), encoding="utf-8")
    with pytest.raises(MigrationError, match="Chunk-count mismatch.*alpha.pdf"):
        _run(db, storage_dir, data_dir)


def test_document_deduplication_and_second_run_idempotency(db, tmp_path):
    storage_dir, data_dir, _, _ = _make_source(tmp_path)
    first = _run(db, storage_dir, data_dir)
    with db.transaction() as cursor:
        cursor.execute("SELECT id FROM documents WHERE filename = 'alpha.pdf'")
        alpha_id = cursor.fetchone()["id"]
    assert _run(db, storage_dir, data_dir) == first
    with db.transaction() as cursor:
        cursor.execute("SELECT COUNT(*) AS count FROM documents")
        assert cursor.fetchone()["count"] == 2
        cursor.execute("SELECT id FROM documents WHERE filename = 'alpha.pdf'")
        assert cursor.fetchone()["id"] == alpha_id
        cursor.execute("SELECT COUNT(*) AS count FROM blocks")
        assert cursor.fetchone()["count"] == 5


def test_rollback_removes_prior_document_when_later_document_conflicts(db, tmp_path):
    storage_dir, data_dir, metadata, _ = _make_source(tmp_path)
    with db.transaction() as cursor:
        cursor.execute(
            """
            INSERT INTO documents (filename, sha256, page_count, block_count, status, file_path)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            ("wrong-name.pdf", metadata[1]["sha256"], 2, 0, "indexed", str(data_dir / "beta.pdf")),
        )
    with pytest.raises(MigrationError, match="Existing document does not match.*beta.pdf"):
        _run(db, storage_dir, data_dir)
    with db.transaction() as cursor:
        cursor.execute("SELECT COUNT(*) AS count FROM documents WHERE filename = 'alpha.pdf'")
        assert cursor.fetchone()["count"] == 0


def test_source_files_remain_unchanged_on_validation_failure(db, tmp_path):
    storage_dir, data_dir, _, _ = _make_source(tmp_path)
    source_files = [
        _metadata_path(storage_dir),
        storage_dir / "chunks.pkl",
        storage_dir / "embeddings.pkl",
        storage_dir / "faiss.index",
        data_dir / "alpha.pdf",
        data_dir / "beta.pdf",
    ]
    before = {path: hashlib.sha256(path.read_bytes()).digest() for path in source_files}
    metadata = json.loads(_metadata_path(storage_dir).read_text(encoding="utf-8"))
    metadata["documents"][0]["chunk_count"] = 100
    _metadata_path(storage_dir).write_text(json.dumps(metadata), encoding="utf-8")
    changed_before_migration = hashlib.sha256(_metadata_path(storage_dir).read_bytes()).digest()
    with pytest.raises(MigrationError):
        _run(db, storage_dir, data_dir)
    assert hashlib.sha256(_metadata_path(storage_dir).read_bytes()).digest() == changed_before_migration
    assert all(
        hashlib.sha256(path.read_bytes()).digest() == digest
        for path, digest in before.items()
        if path != _metadata_path(storage_dir)
    )
