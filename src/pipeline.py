class RAGPipeline:

    def __init__(self, chunks, index):
        self.chunks = chunks
        self.index = index

    def ask(self, question):
        from src.retriever import retrieve
        from src.generator import generate_answer, validate_citations

        results = retrieve(
            question,
            self.index,
            self.chunks
        )

        if results:
            answer = generate_answer(question, results)
        else:
            answer = "I couldn't find the answer in the provided document."

        source_ids = [f"S{index}" for index in range(1, len(results) + 1)]

        return {
            "answer": answer,
            "sources": [
                {
                    "document": result["document"],
                    "page": result["page"],
                    "chunk_id": result.get("chunk_id"),
                    "snippet": result["text"],
                    "citation_id": source_ids[index]
                }
                for index, result in enumerate(results)
            ],
            "citation_validation": validate_citations(answer, source_ids)
        }