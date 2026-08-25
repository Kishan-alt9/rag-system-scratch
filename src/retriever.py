from ollama import embed
import numpy as np


def retrieve(query, index, chunks, top_k=3, document_name=None):
    print("Searching...")

    if index is None or getattr(index, "ntotal", 0) == 0:
        return []

    if top_k is None or top_k <= 0:
        return []

    if index.ntotal != len(chunks):
        raise ValueError(
            "FAISS index and chunks are out of sync: "
            f"{index.ntotal} vectors for {len(chunks)} chunks."
        )

    response = embed(
        model="nomic-embed-text",
        input=query
    )

    query_embedding = np.array(
        [response["embeddings"][0]],
        dtype="float32"
    )

    search_k = index.ntotal if document_name else top_k

    distances, indices = index.search(query_embedding, search_k)

    results = []

    for distance, i in zip(distances[0], indices[0]):
        if i < 0 or i >= len(chunks):
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