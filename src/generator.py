from ollama import chat
import re


_CITATION_PATTERN = re.compile(r"\[(S\d+)\]")
_NO_ANSWER = "I couldn't find the answer in the provided document."


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


def generate_answer(query, results):
    print("Generating answer...")

    context_blocks = []

    for index, result in enumerate(results, start=1):
        citation_id = f"S{index}"
        context_blocks.append(
            f"[{citation_id}] {result['document']}, page {result['page']}\n"
            f"{result['text']}"
        )

    context = "\n\n".join(context_blocks)

    prompt = f"""
You are a helpful AI assistant.

Answer ONLY using the context below.
For every factual claim, include one or more citation markers such as [S1].
Use only citation markers that exist in the provided context. Do not invent or
rename citation markers.

If the answer is not present in the context, reply:
"{_NO_ANSWER}"

Context:
{context}

Question:
{query}
"""

    response = chat(
        model="llama3.2",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]