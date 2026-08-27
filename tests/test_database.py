from uuid import UUID

import psycopg2
import pytest


def document_args():
    return {
        "filename": "report.pdf",
        "sha256": "a" * 64,
        "file_path": "data/raw/report.pdf",
        "page_count": 1,
    }


def test_schema_has_required_tables_and_columns(db):
    with db.transaction() as cursor:
        cursor.execute(
            """
            SELECT table_name, column_name
            FROM information_schema.columns
            WHERE table_schema = current_schema()
            """
        )
        columns = {(row["table_name"], row["column_name"]) for row in cursor}

    required = {
        ("documents", "id"), ("documents", "sha256"),
        ("documents", "block_count"), ("documents", "status"),
        ("pages", "document_id"), ("blocks", "page_id"),
        ("blocks", "content_text"), ("blocks", "table_structure"),
        ("blocks", "bounding_box"), ("blocks", "artifact_path"),
        ("blocks", "faiss_sequence"), ("blocks", "doc_order"),
        ("conversations", "id"), ("messages", "original_query"),
        ("messages", "resolved_query"), ("messages", "citation_metadata"),
    }
    assert required <= columns


def test_uuid_identity_and_document_page_block_hierarchy(db):
    document_id = db.insert_document(**document_args())
    page_id = db.insert_page(document_id, 1)
    block_id = db.insert_block(
        page_id, "table", 0, table_structure={"columns": ["A"]},
        bounding_box=[1.0, 2.0, 3.0, 4.0], faiss_sequence=7,
    )

    assert isinstance(document_id, UUID)
    assert isinstance(page_id, UUID)
    assert isinstance(block_id, UUID)
    with db.transaction() as cursor:
        cursor.execute("SELECT * FROM blocks WHERE id = %s", (block_id,))
        block = cursor.fetchone()
    assert block["content_text"] is None
    assert block["table_structure"] == {"columns": ["A"]}
    assert block["faiss_sequence"] == 7


def test_block_types_and_faiss_sequence_are_not_identity(db):
    document_id = db.insert_document(**document_args())
    page_id = db.insert_page(document_id, 1)
    first = db.insert_block(page_id, "text", 0, "one", faiss_sequence=3)
    second = db.insert_block(page_id, "text", 1, "two", faiss_sequence=3)
    assert first != second

    with pytest.raises(psycopg2.errors.CheckViolation):
        db.insert_block(page_id, "unsupported", 2)


def test_conversation_and_message_retain_query_and_citations(db):
    conversation_id = db.insert_conversation({"scope": "document"})
    message_id = db.insert_message(
        conversation_id, "assistant", "Answer", "first one", "What is X?",
        {"sources": [{"block_id": "abc"}]},
    )

    with db.transaction() as cursor:
        cursor.execute("SELECT * FROM messages WHERE id = %s", (message_id,))
        message = cursor.fetchone()
    assert message["conversation_id"] == conversation_id
    assert message["original_query"] == "first one"
    assert message["resolved_query"] == "What is X?"
    assert message["citation_metadata"]["sources"][0]["block_id"] == "abc"


def test_document_delete_cascades_pages_and_blocks(db):
    document_id = db.insert_document(**document_args())
    page_id = db.insert_page(document_id, 1)
    block_id = db.insert_block(page_id, "image", 0, artifact_path="img.png")
    with db.transaction() as cursor:
        cursor.execute("DELETE FROM documents WHERE id = %s", (document_id,))
        cursor.execute("SELECT COUNT(*) AS count FROM blocks WHERE id = %s", (block_id,))
        assert cursor.fetchone()["count"] == 0


def test_transaction_rolls_back_on_error(db):
    with pytest.raises(ValueError):
        with db.transaction() as cursor:
            cursor.execute(
                "INSERT INTO documents (filename, sha256, file_path) VALUES (%s, %s, %s)",
                ("rollback.pdf", "b" * 64, "rollback.pdf"),
            )
            raise ValueError("rollback")

    with db.transaction() as cursor:
        cursor.execute("SELECT COUNT(*) AS count FROM documents")
        assert cursor.fetchone()["count"] == 0