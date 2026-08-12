import faiss
from pathlib import Path
import hashlib
import json
import pickle
import sys
import numpy as np

STORAGE_DIR = Path("storage")
CHUNKS_PATH = STORAGE_DIR / "chunks.pkl"
INDEX_PATH = STORAGE_DIR / "faiss.index"
METADATA_PATH = STORAGE_DIR / "metadata.json"
DEFAULT_PDF_PATH = Path("data/raw/sample.pdf")


class DuplicateDocumentError(ValueError):
    pass


def calculate_file_hash(file_path):
    sha256 = hashlib.sha256()

    with open(file_path, "rb") as file:
        for block in iter(lambda: file.read(1024 * 1024), b""):
            sha256.update(block)

    return sha256.hexdigest()


def save_chunks(chunks):
    STORAGE_DIR.mkdir(exist_ok=True)

    with open(CHUNKS_PATH, "wb") as file:
        pickle.dump(chunks, file)


def load_chunks():
    if not CHUNKS_PATH.exists():
        return []

    with open(CHUNKS_PATH, "rb") as file:
        return pickle.load(file)


def save_metadata(documents):
    STORAGE_DIR.mkdir(exist_ok=True)

    with open(METADATA_PATH, "w") as file:
        json.dump(
            {"documents": documents},
            file,
            indent=4
        )


def load_metadata():
    if not METADATA_PATH.exists():
        return {"documents": []}

    with open(METADATA_PATH, "r") as file:
        return json.load(file)


def save_index(index):
    STORAGE_DIR.mkdir(exist_ok=True)

    faiss.write_index(index, str(INDEX_PATH))


def load_index():
    return faiss.read_index(str(INDEX_PATH))


def _load_existing_index():
    if not INDEX_PATH.exists():
        return None

    return load_index()


def get_document_filename(document):
    if isinstance(document, dict):
        return document.get("filename")

    return document


def _count_chunks_for_document(chunks, filename):
    return sum(1 for chunk in chunks if chunk.get("document") == filename)


def _page_count_for_document(chunks, filename):
    pages = [
        chunk.get("page")
        for chunk in chunks
        if chunk.get("document") == filename and chunk.get("page") is not None
    ]

    return max(pages) if pages else 0


def _legacy_document_record(filename, chunks):
    file_path = Path("data/raw") / filename
    file_hash = calculate_file_hash(file_path) if file_path.exists() else filename

    return {
        "id": file_hash,
        "filename": filename,
        "sha256": file_hash if file_path.exists() else None,
        "page_count": _page_count_for_document(chunks, filename),
        "chunk_count": _count_chunks_for_document(chunks, filename),
        "status": "indexed"
    }


def normalize_metadata(metadata, chunks=None):
    chunks = chunks or []
    documents = []

    for document in metadata.get("documents", []):
        if isinstance(document, dict):
            filename = document.get("filename") or document.get("name")
            file_hash = document.get("sha256") or document.get("id")

            documents.append({
                "id": document.get("id") or file_hash or filename,
                "filename": filename,
                "sha256": file_hash,
                "page_count": document.get("page_count", _page_count_for_document(chunks, filename)),
                "chunk_count": document.get("chunk_count", _count_chunks_for_document(chunks, filename)),
                "status": document.get("status", "indexed")
            })
        else:
            documents.append(_legacy_document_record(document, chunks))

    return {"documents": documents}


def _ensure_not_duplicate(documents, file_hash, filename):
    for document in documents:
        if document.get("sha256") == file_hash:
            raise DuplicateDocumentError(
                f"{filename} is already indexed as {document.get('filename')}."
            )

        if document.get("filename") == filename:
            raise DuplicateDocumentError(f"{filename} is already indexed.")


def _embedding_matrix(chunks):
    embeddings = []

    for chunk in chunks:
        if "embedding" not in chunk:
            raise ValueError("Cannot add chunks before embeddings are created.")

        embeddings.append(chunk["embedding"])

    embeddings = np.array(embeddings, dtype="float32")

    if embeddings.ndim != 2:
        raise ValueError("Embeddings must be a 2D array.")

    return embeddings


def index_pdf(pdf_path=DEFAULT_PDF_PATH):
    print("INDEXER TEST STARTED")

    from src.pdf_loader import load_pdf
    from src.chunker import chunk_pages
    from src.embedder import create_embeddings
    from src.vector_store import create_vector_store

    file_hash = calculate_file_hash(pdf_path)
    existing_chunks = load_chunks()
    metadata = normalize_metadata(load_metadata(), existing_chunks)
    documents = metadata["documents"]
    existing_index = _load_existing_index()

    if existing_index is not None and existing_index.ntotal != len(existing_chunks):
        raise ValueError(
            "Stored FAISS index and chunks are out of sync: "
            f"{existing_index.ntotal} vectors for {len(existing_chunks)} chunks."
        )

    _ensure_not_duplicate(documents, file_hash, pdf_path.name)

    pages = load_pdf(pdf_path)

    print("Number of pages:", len(pages))

    if pages:
        print("First page:", pages[0])
    else:
        print("NO PAGES LOADED")

    print("Creating chunks...")
    new_chunks = chunk_pages(pages)

    print("Number of chunks:", len(new_chunks))

    new_chunks = create_embeddings(new_chunks)

    if new_chunks:
        print("Embedding type:", type(new_chunks[0]["embedding"]))
        print("Embedding length:", len(new_chunks[0]["embedding"]))

    if existing_index is None:
        index = create_vector_store(new_chunks)
    else:
        new_embeddings = _embedding_matrix(new_chunks)
        existing_index.add(new_embeddings)
        index = existing_index

    chunks = existing_chunks + new_chunks
    documents.append({
        "id": file_hash,
        "filename": pdf_path.name,
        "sha256": file_hash,
        "page_count": len(pages),
        "chunk_count": len(new_chunks),
        "status": "indexed"
    })

    print("Saving...")
    save_chunks(chunks)
    save_index(index)
    save_metadata(documents)

    print("Testing load...")
    loaded_index = load_index()
    loaded_chunks = load_chunks()

    print("Original vectors:", index.ntotal)
    print("Loaded vectors:", loaded_index.ntotal)
    print("Loaded chunks:", len(loaded_chunks))


if __name__ == "__main__":
    try:
        selected_pdf_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PDF_PATH
        index_pdf(selected_pdf_path)
    except ValueError as error:
        print(f"Error: {error}")
        sys.exit(1)
