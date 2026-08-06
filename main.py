from pathlib import Path
from src.pdf_loader import load_pdf
from src.chunker import chunk_pages
from src.embedder import create_embeddings
from src.vector_store import create_vector_store
from src.retriever import retrieve
from ollama import embed
from src.generator import generate_answer
import numpy as np
def main():
    pdf_path = Path("data/raw/sample.pdf")

    if not pdf_path.exists():
        print("❌ PDF not found!")
        return

    pages = load_pdf(pdf_path)

    chunks = chunk_pages(pages)

    chunks = create_embeddings(chunks)

    index = create_vector_store(chunks)

    query = input("\nAsk a question: ")

    response = embed(
    model="nomic-embed-text",
    input=query
)

    query_embedding = np.array(
    [response["embeddings"][0]],
    dtype="float32"
)

    distances, indices = index.search(query_embedding, 3)

    

    results = []

    for i in indices[0]:
      results.append(chunks[i])

    results = retrieve(query, index, chunks)

    answer = generate_answer(query, results)

    print("\nAnswer:\n")
    print(answer)


if __name__ == "__main__":
    main()