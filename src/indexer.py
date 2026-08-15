import faiss
from pathlib import Path
import hashlib
import json
import pickle
import sys
import numpy as np
import os
import tempfile
import shutil

STORAGE_DIR = Path("storage")
CHUNKS_PATH = STORAGE_DIR / "chunks.pkl"
EMBEDDINGS_PATH = STORAGE_DIR / "embeddings.pkl"
INDEX_PATH = STORAGE_DIR / "faiss.index"
METADATA_PATH = STORAGE_DIR / "metadata.json"
DEFAULT_PDF_PATH = Path("data/raw/sample.pdf")


class DuplicateDocumentError(ValueError):
    pass


class DocumentNotFoundError(ValueError):
    pass


def calculate_file_hash(file_path):
    sha256 = hashlib.sha256()

    with open(file_path, "rb") as file:
        for block in iter(lambda: file.read(1024 * 1024), b""):
            sha256.update(block)

    return sha256.hexdigest()


def save_chunks(chunks, tmp=False):
    STORAGE_DIR.mkdir(exist_ok=True)
    path = CHUNKS_PATH.with_suffix(CHUNKS_PATH.suffix + ".tmp") if tmp else CHUNKS_PATH

    with open(path, "wb") as file:
        pickle.dump(chunks, file)


def load_chunks():
    if not CHUNKS_PATH.exists():
        return []

    with open(CHUNKS_PATH, "rb") as file:
        return pickle.load(file)


def save_embeddings(embeddings, tmp=False):
    STORAGE_DIR.mkdir(exist_ok=True)
    path = EMBEDDINGS_PATH.with_suffix(EMBEDDINGS_PATH.suffix + ".tmp") if tmp else EMBEDDINGS_PATH

    # embeddings is expected to be a numpy array
    with open(path, "wb") as file:
        pickle.dump(embeddings, file)


def load_embeddings():
    if not EMBEDDINGS_PATH.exists():
        return None

    with open(EMBEDDINGS_PATH, "rb") as file:
        return pickle.load(file)


def save_metadata(documents, tmp=False):
    STORAGE_DIR.mkdir(exist_ok=True)
    path = METADATA_PATH.with_suffix(METADATA_PATH.suffix + ".tmp") if tmp else METADATA_PATH

    with open(path, "w") as file:
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


def save_index(index, tmp=False):
    STORAGE_DIR.mkdir(exist_ok=True)
    path = INDEX_PATH.with_suffix(INDEX_PATH.suffix + ".tmp") if tmp else INDEX_PATH

    faiss.write_index(index, str(path))


def load_index():
    if not INDEX_PATH.exists():
        return None

    return faiss.read_index(str(INDEX_PATH))


def _load_existing_index():
    return load_index()


def _atomic_replace(tmp_to_orig):
    # tmp_to_orig: dict[tmp_path(str)->orig_path(str)]
    for tmp, orig in tmp_to_orig.items():
        os.replace(tmp, orig)


def _reconstruct_embeddings_from_faiss(index):
    # Reconstruct embeddings from FAISS index if possible
    if index is None:
        return None

    vectors = []
    for i in range(index.ntotal):
        try:
            v = index.reconstruct(i)
        except Exception:
            # reconstruct not available
            return None
        vectors.append(v.astype("float32"))

    return np.array(vectors, dtype="float32")


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
    existing_embeddings = load_embeddings()
    metadata = normalize_metadata(load_metadata(), existing_chunks)
    documents = metadata["documents"]
    existing_index = _load_existing_index()

    # migrate embeddings if missing
    if existing_embeddings is None and existing_index is not None:
        reconstructed = _reconstruct_embeddings_from_faiss(existing_index)
        if reconstructed is not None:
            existing_embeddings = reconstructed

    if existing_index is not None and existing_index.ntotal != len(existing_chunks):
        raise ValueError(
            "Stored FAISS index and chunks are out of sync: "
            f"{existing_index.ntotal} vectors for {len(existing_chunks)} chunks."
        )

    if existing_embeddings is not None and len(existing_chunks) != existing_embeddings.shape[0]:
        raise ValueError("Stored embeddings and chunks are out of sync.")

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

    # prepare embeddings arrays
    new_embeddings = _embedding_matrix(new_chunks) if new_chunks else np.empty((0, 0), dtype="float32")

    if existing_index is None:
        index = create_vector_store(new_chunks)
        final_embeddings = new_embeddings
    else:
        existing_index.add(new_embeddings)
        index = existing_index
        if existing_embeddings is None:
            raise ValueError("Existing embeddings missing; cannot safely append without embeddings.pkl or reconstruct support.")
        final_embeddings = np.vstack([existing_embeddings, new_embeddings]) if new_embeddings.size else existing_embeddings

    chunks = existing_chunks + new_chunks
    documents.append({
        "id": file_hash,
        "filename": pdf_path.name,
        "sha256": file_hash,
        "page_count": len(pages),
        "chunk_count": len(new_chunks),
        "status": "indexed"
    })

    print("Saving (atomic)...")
    # write temp files
    tmp_chunks = CHUNKS_PATH.with_suffix(CHUNKS_PATH.suffix + ".tmp")
    tmp_embeddings = EMBEDDINGS_PATH.with_suffix(EMBEDDINGS_PATH.suffix + ".tmp")
    tmp_index = INDEX_PATH.with_suffix(INDEX_PATH.suffix + ".tmp")
    tmp_metadata = METADATA_PATH.with_suffix(METADATA_PATH.suffix + ".tmp")

    # dump data to temp files
    with open(tmp_chunks, "wb") as f:
        pickle.dump(chunks, f)

    with open(tmp_embeddings, "wb") as f:
        pickle.dump(final_embeddings, f)

    faiss.write_index(index, str(tmp_index))

    with open(tmp_metadata, "w") as f:
        json.dump({"documents": documents}, f, indent=4)

    # validations
    loaded_index = faiss.read_index(str(tmp_index))
    if loaded_index.ntotal != len(chunks):
        # cleanup
        for p in [tmp_chunks, tmp_embeddings, tmp_index, tmp_metadata]:
            try:
                os.remove(p)
            except Exception:
                pass
        raise ValueError("Validation failed: FAISS index ntotal does not match chunks length.")

    # all good, replace originals atomically
    _atomic_replace({str(tmp_chunks): str(CHUNKS_PATH), str(tmp_embeddings): str(EMBEDDINGS_PATH), str(tmp_index): str(INDEX_PATH), str(tmp_metadata): str(METADATA_PATH)})

    print("Indexing complete.")


def delete_document(document_id):
    # load current state
    chunks = load_chunks()
    embeddings = load_embeddings()
    if embeddings is None:
        # attempt reconstruct
        existing_index = _load_existing_index()
        embeddings = _reconstruct_embeddings_from_faiss(existing_index)

    metadata = normalize_metadata(load_metadata(), chunks)
    documents = metadata["documents"]

    target = None
    for doc in documents:
        if doc.get("id") == document_id or doc.get("sha256") == document_id:
            target = doc
            break

    if target is None:
        raise DocumentNotFoundError(f"Document {document_id} not found")

    filename = target["filename"]

    # compute retained chunks and embeddings
    retained_chunks = [c for c in chunks if c.get("document") != filename]
    retained_indices = [i for i, c in enumerate(chunks) if c.get("document") != filename]

    if embeddings is not None:
        retained_embeddings = embeddings[retained_indices]
    else:
        retained_embeddings = None

    # rebuild index
    if retained_chunks:
        if retained_embeddings is None:
            raise ValueError("Cannot rebuild FAISS: embeddings missing for retained chunks.")
        from src.vector_store import create_vector_store
        new_index = create_vector_store(retained_chunks)
    else:
        new_index = None

    # prepare new metadata
    new_documents = [d for d in documents if d.get("filename") != filename]

    # atomic write to tmp files then replace
    tmp_chunks = CHUNKS_PATH.with_suffix(CHUNKS_PATH.suffix + ".tmp")
    tmp_embeddings = EMBEDDINGS_PATH.with_suffix(EMBEDDINGS_PATH.suffix + ".tmp")
    tmp_index = INDEX_PATH.with_suffix(INDEX_PATH.suffix + ".tmp")
    tmp_metadata = METADATA_PATH.with_suffix(METADATA_PATH.suffix + ".tmp")

    with open(tmp_chunks, "wb") as f:
        pickle.dump(retained_chunks, f)

    if retained_embeddings is not None:
        with open(tmp_embeddings, "wb") as f:
            pickle.dump(retained_embeddings, f)
    else:
        # ensure no embeddings file
        if EMBEDDINGS_PATH.exists():
            # write empty array
            with open(tmp_embeddings, "wb") as f:
                pickle.dump(np.empty((0, 0), dtype="float32"), f)

    if new_index is not None:
        faiss.write_index(new_index, str(tmp_index))
    else:
        # create an empty file to replace existing index
        open(tmp_index, "wb").close()

    with open(tmp_metadata, "w") as f:
        json.dump({"documents": new_documents}, f, indent=4)

    # validate
    if new_index is not None:
        loaded_index = faiss.read_index(str(tmp_index))
        if loaded_index.ntotal != len(retained_chunks):
            for p in [tmp_chunks, tmp_embeddings, tmp_index, tmp_metadata]:
                try:
                    os.remove(p)
                except Exception:
                    pass
            raise ValueError("Validation failed after delete: FAISS ntotal mismatch.")

    # replace
    _atomic_replace({str(tmp_chunks): str(CHUNKS_PATH), str(tmp_embeddings): str(EMBEDDINGS_PATH), str(tmp_index): str(INDEX_PATH), str(tmp_metadata): str(METADATA_PATH)})

    return True


def reindex_document(document_id, pdf_path):
    from src.pdf_loader import load_pdf
    from src.chunker import chunk_pages
    from src.embedder import create_embeddings
    from src.vector_store import create_vector_store

    chunks = load_chunks()
    embeddings = load_embeddings()
    if embeddings is None:
        existing_index = _load_existing_index()
        embeddings = _reconstruct_embeddings_from_faiss(existing_index)

    metadata = normalize_metadata(load_metadata(), chunks)
    documents = metadata["documents"]

    target = None
    for doc in documents:
        if doc.get("id") == document_id or doc.get("sha256") == document_id:
            target = doc
            break

    if target is None:
        raise DocumentNotFoundError(f"Document {document_id} not found")

    filename = target["filename"]

    # retain other chunks/embeddings
    retained_chunks = [c for c in chunks if c.get("document") != filename]
    retained_indices = [i for i, c in enumerate(chunks) if c.get("document") != filename]

    if embeddings is not None:
        retained_embeddings = embeddings[retained_indices]
    else:
        retained_embeddings = None

    # process new pdf
    pages = load_pdf(pdf_path)
    new_chunks = chunk_pages(pages)
    new_chunks = create_embeddings(new_chunks)

    new_embeddings = _embedding_matrix(new_chunks) if new_chunks else np.empty((0, 0), dtype="float32")

    # combine
    final_chunks = retained_chunks + new_chunks

    if retained_embeddings is None and retained_chunks:
        raise ValueError("Cannot rebuild FAISS: embeddings missing for retained chunks.")

    final_embeddings = np.vstack([retained_embeddings, new_embeddings]) if retained_chunks and new_embeddings.size else (new_embeddings if not retained_chunks else retained_embeddings)

    # rebuild index
    if final_chunks:
        new_index = create_vector_store(final_chunks)
    else:
        new_index = None

    # update metadata for this document
    file_hash = calculate_file_hash(pdf_path)
    new_documents = []
    for doc in documents:
        if doc.get("filename") == filename:
            new_documents.append({
                "id": file_hash,
                "filename": pdf_path.name,
                "sha256": file_hash,
                "page_count": len(pages),
                "chunk_count": len(new_chunks),
                "status": "indexed"
            })
        else:
            new_documents.append(doc)

    # atomic write tmp files
    tmp_chunks = CHUNKS_PATH.with_suffix(CHUNKS_PATH.suffix + ".tmp")
    tmp_embeddings = EMBEDDINGS_PATH.with_suffix(EMBEDDINGS_PATH.suffix + ".tmp")
    tmp_index = INDEX_PATH.with_suffix(INDEX_PATH.suffix + ".tmp")
    tmp_metadata = METADATA_PATH.with_suffix(METADATA_PATH.suffix + ".tmp")

    with open(tmp_chunks, "wb") as f:
        pickle.dump(final_chunks, f)

    with open(tmp_embeddings, "wb") as f:
        pickle.dump(final_embeddings, f)

    if new_index is not None:
        faiss.write_index(new_index, str(tmp_index))
    else:
        open(tmp_index, "wb").close()

    with open(tmp_metadata, "w") as f:
        json.dump({"documents": new_documents}, f, indent=4)

    # validation
    if new_index is not None:
        loaded_index = faiss.read_index(str(tmp_index))
        if loaded_index.ntotal != len(final_chunks):
            for p in [tmp_chunks, tmp_embeddings, tmp_index, tmp_metadata]:
                try:
                    os.remove(p)
                except Exception:
                    pass
            raise ValueError("Validation failed after reindex: FAISS ntotal mismatch.")

    # replace
    _atomic_replace({str(tmp_chunks): str(CHUNKS_PATH), str(tmp_embeddings): str(EMBEDDINGS_PATH), str(tmp_index): str(INDEX_PATH), str(tmp_metadata): str(METADATA_PATH)})

    return True


if __name__ == "__main__":
    try:
        selected_pdf_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PDF_PATH
        index_pdf(selected_pdf_path)
    except ValueError as error:
        print(f"Error: {error}")
        sys.exit(1)
