import faiss
import numpy as np


def create_vector_store(chunks):
    print("Creating FAISS index...")

    embeddings = []

    for chunk in chunks:
        embeddings.append(chunk["embedding"])

    embeddings = np.array(embeddings, dtype="float32")

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(embeddings)

    return index