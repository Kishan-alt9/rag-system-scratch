from ollama import embed
import numpy as np


def retrieve(query, index, chunks, top_k=3):
    print("Searching...")

    response = embed(
        model="nomic-embed-text",
        input=query
    )

    query_embedding = np.array(
        [response["embeddings"][0]],
        dtype="float32"
    )

    distances, indices = index.search(query_embedding, top_k)

    results = []

    for i in indices[0]:
        results.append(chunks[i])

    return results