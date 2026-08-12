class RAGPipeline:

    def __init__(self, chunks, index):
        self.chunks = chunks
        self.index = index

    def ask(self, question):
        from src.retriever import retrieve
        from src.generator import generate_answer

        results = retrieve(
            question,
            self.index,
            self.chunks
        )

        answer = generate_answer(
            question,
            results
        )

        return {
            "answer": answer,
            "sources": [
                {
                    "document": result["document"],
                    "page": result["page"]
                }
                for result in results
            ]
        }