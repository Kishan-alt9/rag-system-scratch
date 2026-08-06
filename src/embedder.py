from ollama import embed


def create_embeddings(chunks):
    print("Creating embeddings...")

    for chunk in chunks:
        response = embed(
            model="nomic-embed-text",
            input=chunk["text"]
        )

        chunk["embedding"] = response["embeddings"][0]

    return chunks