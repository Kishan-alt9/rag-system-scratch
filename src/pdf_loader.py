import fitz


def load_pdf(pdf_path):
    print("Loading PDF...")

    doc = fitz.open(pdf_path)

    pages = []

    for page_number in range(doc.page_count):
        page = doc.load_page(page_number)

        text = page.get_text()

        pages.append({
            "page": page_number + 1,
            "text": text
        })

    doc.close()

    return pages