import re
import uuid


MAX_CONVERSATION_TURNS = 6
MAX_HISTORY_CHARS = 6000
_FOLLOW_UP_PATTERN = re.compile(
    r"\b(it|this|that|these|those|they|them|its|their|previous|above|earlier)\b",
    re.IGNORECASE,
)


def _bounded_history(history):
    bounded = history[-MAX_CONVERSATION_TURNS:]
    while bounded and sum(len(turn["question"]) + len(turn["answer"]) for turn in bounded) > MAX_HISTORY_CHARS:
        bounded = bounded[1:]
    return bounded


def _build_retrieval_query(question, history):
    if not history or not _FOLLOW_UP_PATTERN.search(question):
        return question

    context = "\n".join(
        f"Previous question: {turn['question']}\nPrevious answer: {turn['answer']}"
        for turn in _bounded_history(history)
    )
    return f"Conversation context:\n{context}\nCurrent question: {question}"


class RAGPipeline:

    def __init__(self, chunks, index):
        self.chunks = chunks
        self.index = index
        self._conversations = {}

    def ask(self, question, conversation_id=None):
        from src.retriever import retrieve
        from src.generator import generate_answer, validate_citations

        conversation_id = conversation_id or uuid.uuid4().hex
        history = _bounded_history(self._conversations.get(conversation_id, []))
        retrieval_query = _build_retrieval_query(question, history)

        results = retrieve(
            retrieval_query,
            self.index,
            self.chunks
        )

        if results:
            answer = generate_answer(question, results, history)
        else:
            answer = "I couldn't find the answer in the provided document."

        self._conversations[conversation_id] = _bounded_history(
            history + [{"question": question, "answer": answer}]
        )

        source_ids = [f"S{index}" for index in range(1, len(results) + 1)]

        return {
            "conversation_id": conversation_id,
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

    def reset_conversation(self, conversation_id):
        return self._conversations.pop(conversation_id, None) is not None