import re
import uuid


MAX_CONVERSATION_TURNS = 6
MAX_HISTORY_CHARS = 6000
_REFERENCE_PATTERN = re.compile(
    r"\b(it|this|that|these|those|they|them|its|their|previous|above|earlier)\b",
    re.IGNORECASE,
)
_ORDINAL_PATTERN = re.compile(
    r"\b(?:the\s+)?(first|second|third|fourth|fifth)\s+(?:one|point|item)\b",
    re.IGNORECASE,
)
_PREVIOUS_POINT_PATTERN = re.compile(
    r"\bthe\s+previous\s+(?:one|point|item)\b",
    re.IGNORECASE,
)
_EXPLICIT_LIST_PATTERN = re.compile(
    r"\b(?:the\s+)?(?:[a-z][\w-]*\s+){0,6}(?:include|includes|are)\s+"
    r"(?P<items>[^.!?\n]+)",
    re.IGNORECASE,
)
_CITATION_PATTERN = re.compile(r"\s*\[S\d+\]", re.IGNORECASE)
_ORDINALS = {"first": 0, "second": 1, "third": 2, "fourth": 3, "fifth": 4}


def _bounded_history(history):
    bounded = history[-MAX_CONVERSATION_TURNS:]
    while bounded and sum(len(turn["question"]) + len(turn["answer"]) for turn in bounded) > MAX_HISTORY_CHARS:
        bounded = bounded[1:]
    return bounded


def _extract_points(answer):
    points = []
    for line in (answer or "").splitlines():
        match = re.match(r"^\s*(?:\d+[.)]|[-*])\s+(.+?)\s*$", line)
        if match:
            point = re.sub(r"\s*\[S\d+\]", "", match.group(1)).strip()
            if point:
                points.append(point)
    if points:
        return points

    list_match = _EXPLICIT_LIST_PATTERN.search(answer or "")
    if not list_match:
        return points

    list_text = list_match.group("items")
    if re.search(r"\b(?:such as|including)\b", list_text, re.IGNORECASE):
        return points
    list_text = re.split(r"\s+and\s+others?\b", list_text, maxsplit=1, flags=re.IGNORECASE)[0]
    candidates = re.split(r",", list_text)
    if len(candidates) > 1 and re.search(r"\s+and\s+", candidates[-1], re.IGNORECASE):
        candidates[-1:] = re.split(r"\s+and\s+", candidates[-1], maxsplit=1, flags=re.IGNORECASE)

    points = []
    for candidate in candidates:
        point = _CITATION_PATTERN.sub("", candidate).strip(" \t:;")
        if point:
            points.append(point)

    if len(points) >= 2:
        return points
    return points


def _turn_topic(question, resolved_question=None):
    return (resolved_question or question).strip().rstrip("?.!")


def _resolve_question(question, history):
    if not history:
        return question

    previous = history[-1]
    points = previous.get("points", [])
    ordinal = _ORDINAL_PATTERN.search(question)
    if ordinal:
        point_index = _ORDINALS[ordinal.group(1).lower()]
        if point_index < len(points):
            return _ORDINAL_PATTERN.sub(points[point_index], question, count=1)
        return question

    if _PREVIOUS_POINT_PATTERN.search(question) and points:
        return _PREVIOUS_POINT_PATTERN.sub(points[-1], question, count=1)

    if _REFERENCE_PATTERN.search(question):
        topic = previous.get("topic")
        if topic:
            return _REFERENCE_PATTERN.sub(topic, question)

    return question


class RAGPipeline:

    def __init__(self, chunks, index):
        self.chunks = chunks
        self.index = index
        self._conversations = {}

    def ask(self, question, conversation_id=None, document_name=None):
        from src.retriever import retrieve
        from src.generator import generate_answer, validate_citations

        conversation_id = conversation_id or uuid.uuid4().hex
        history = _bounded_history(self._conversations.get(conversation_id, []))
        resolved_question = _resolve_question(question, history)

        results = retrieve(
            resolved_question,
            self.index,
            self.chunks,
            document_name=document_name
        )

        if results:
            answer = generate_answer(
                question,
                results,
                history,
                resolved_question=resolved_question
            )
        else:
            answer = "I couldn't find the answer in the provided document."

        self._conversations[conversation_id] = _bounded_history(history + [{
            "question": question,
            "resolved_question": resolved_question,
            "answer": answer,
            "topic": _turn_topic(question, resolved_question),
            "points": _extract_points(answer) or (history[-1].get("points", []) if history else []),
            "documents": [result.get("document") for result in results]
        }])

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