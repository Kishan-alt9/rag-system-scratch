from ollama import chat
import os
import re


_CITATION_PATTERN = re.compile(r"\[(S\d+)\]")
_NO_ANSWER = "I couldn't find the answer in the provided document."
_DEFAULT_LLM_MODEL = "qwen3:8b"
LLM_MODEL = os.getenv("RAG_LLM_MODEL", _DEFAULT_LLM_MODEL).strip() or _DEFAULT_LLM_MODEL


def extract_citation_ids(answer):
    return list(dict.fromkeys(_CITATION_PATTERN.findall(answer or "")))


def validate_citations(answer, source_ids):
    cited_ids = extract_citation_ids(answer)
    source_id_set = set(source_ids)
    invalid_ids = [citation_id for citation_id in cited_ids if citation_id not in source_id_set]

    return {
        "valid": not invalid_ids,
        "cited_ids": cited_ids,
        "invalid_ids": invalid_ids
    }


def generate_answer(original_question, results, conversation_history=None, resolved_question=None):
    print("Generating answer...")

    context_blocks = []

    for index, result in enumerate(results, start=1):
        citation_id = f"S{index}"
        context_blocks.append(
            f"[{citation_id}] {result['document']}, page {result['page']}\n"
            f"{result['text']}"
        )

    context = "\n\n".join(context_blocks)
    history_context = "\n\n".join(
        f"User: {turn['question']}\nAssistant: {turn['answer']}"
        for turn in (conversation_history or [])
    )
    history_section = (
        f"Conversation history (use for reference resolution only; cite current context only):\n{history_context}\n\n"
        if history_context
        else ""
    )

    prompt = f"""
You are a helpful AI assistant.

Answer ONLY using the context below.
Treat the resolved question as authoritative. Answer specifically about the
subject named in it; do not broaden an item-specific question to its parent
topic and do not reinterpret its reference from the context.
For every factual claim, include one or more citation markers such as [S1].
Use only citation markers that exist in the provided context. Do not invent or
rename citation markers.

If the answer is not present in the context, reply:
"{_NO_ANSWER}"

{history_section}Context:
{context}

Original question:
{original_question}

Resolved question (authoritative for interpreting references):
{resolved_question or original_question}
"""

    response = chat(
        model=LLM_MODEL,
        think=False,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]