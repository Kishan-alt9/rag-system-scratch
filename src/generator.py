from ollama import chat


def generate_answer(query, results):
    print("Generating answer...")

    context = ""

    for result in results:
        context += result["text"] + "\n\n"

    prompt = f"""
You are a helpful AI assistant.

Answer ONLY using the context below.

If the answer is not present in the context, reply:
"I couldn't find the answer in the provided document."

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