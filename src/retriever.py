from ollama import embed
import numpy as np


def retrieve(query, index, chunks, top_k=3, document_name=None):
    print("Searching...")

    response = embed(
        model="nomic-embed-text",
        input=query
    )

    query_embedding = np.array(
        [response["embeddings"][0]],
        dtype="float32"
    )

    search_k = top_k
    if document_name:
        search_k = min(index.ntotal, max(top_k * 5, top_k))

    distances, indices = index.search(query_embedding, search_k)

    results = []

    for distance, i in zip(distances[0], indices[0]):
        if i < 0:
            continue
        chunk = chunks[i]
        if document_name and chunk.get("document") != document_name:
            continue
        result = dict(chunk)
        result["distance"] = float(distance)
        results.append(result)
        if len(results) == top_k:
            break

    return results