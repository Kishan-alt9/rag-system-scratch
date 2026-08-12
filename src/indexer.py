import faiss
from pathlib import Path
import json
import pickle
import sys

STORAGE_DIR = Path("storage")
CHUNKS_PATH = STORAGE_DIR / "chunks.pkl"
INDEX_PATH = STORAGE_DIR / "faiss.index"
METADATA_PATH = STORAGE_DIR / "metadata.json"
DEFAULT_PDF_PATH = Path("data/raw/sample.pdf")


def save_chunks(chunks):
    STORAGE_DIR.mkdir(exist_ok=True)

    with open(CHUNKS_PATH, "wb") as file:
        pickle.dump(chunks, file)


def load_chunks():
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


def index_pdf(pdf_path=DEFAULT_PDF_PATH):
    print("INDEXER TEST STARTED")

    from src.pdf_loader import load_pdf
    from src.chunker import chunk_pages
    from src.embedder import create_embeddings
    from src.vector_store import create_vector_store

    pages = load_pdf(pdf_path)

    print("Number of pages:", len(pages))

    if pages:
        print("First page:", pages[0])
    else:
        print("NO PAGES LOADED")

    print("Creating chunks...")
    chunks = chunk_pages(pages)

    print("Number of chunks:", len(chunks))

    chunks = create_embeddings(chunks)

    if chunks:
        print("Embedding type:", type(chunks[0]["embedding"]))
        print("Embedding length:", len(chunks[0]["embedding"]))

    index = create_vector_store(chunks)

    print("Saving...")
    save_chunks(chunks)
    save_index(index)
    save_metadata([pdf_path.name])

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
