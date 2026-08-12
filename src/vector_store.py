import faiss
import numpy as np


def create_vector_store(chunks):
    print("Creating FAISS index...")

    if not chunks:
        raise ValueError("Cannot create a FAISS index because no chunks were created.")

    embeddings = []

    for chunk in chunks:
        if "embedding" not in chunk:
            raise ValueError("Cannot create a FAISS index before embeddings are created.")

        embeddings.append(chunk["embedding"])

    embeddings = np.array(embeddings, dtype="float32")

    if embeddings.ndim != 2:
        raise ValueError("Embeddings must be a 2D array.")

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(embeddings)

    return index
