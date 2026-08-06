def chunk_pages(pages, chunk_size=500):
    chunks = []

    for page in pages:
        text = page["text"]

        for i in range(0, len(text), chunk_size):
            chunk = text[i:i + chunk_size]

            chunks.append({
                "page": page["page"],
                "text": chunk
            })

    return chunks