import os
from pathlib import Path

import fitz


TESSDATA_PATH = Path(r"C:\Program Files\Tesseract-OCR\tessdata")


def _configure_tesseract():
    if TESSDATA_PATH.exists():
        os.environ.setdefault("TESSDATA_PREFIX", str(TESSDATA_PATH))


def _extract_pages_with_ocr(doc, pdf_path):
    print("Running OCR...")

    _configure_tesseract()

    pages = []
    total_text_length = 0

    for page_number in range(doc.page_count):
        page = doc.load_page(page_number)

        textpage = page.get_textpage_ocr(
            language="eng",
            dpi=300,
            full=True
        )
        text = page.get_text(textpage=textpage)
        total_text_length += len(text.strip())

        pages.append({
            "document": pdf_path.name,
            "page": page_number + 1,
            "text": text
        })

    if total_text_length == 0:
        raise ValueError(
            f"No readable text found in {pdf_path}. "
            "Normal PDF extraction and OCR both produced no text."
        )

    return pages


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

    if pages and total_text_length == 0:
        try:
            if image_count:
                return _extract_pages_with_ocr(doc, pdf_path)

            raise ValueError(f"No extractable text found in {pdf_path}.")
        finally:
            doc.close()

    doc.close()

    return pages
