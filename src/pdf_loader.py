import fitz


def load_pdf(pdf_path):
    print("Loading PDF...")

    doc = fitz.open(pdf_path)

    pages = []
    total_text_length = 0
    image_count = 0

    for page_number in range(doc.page_count):
        page = doc.load_page(page_number)

        text = page.get_text()
        total_text_length += len(text.strip())
        image_count += len(page.get_images(full=True))

        pages.append({
            "document": pdf_path.name,
            "page": page_number + 1,
            "text": text
        })

    doc.close()

    if pages and total_text_length == 0:
        if image_count:
            raise ValueError(
                f"No extractable text found in {pdf_path}. "
                "This looks like an image-only/scanned PDF, so it needs OCR "
                "before it can be chunked."
            )

        raise ValueError(f"No extractable text found in {pdf_path}.")

    return pages
