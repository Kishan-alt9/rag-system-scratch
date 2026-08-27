"""Direct PostgreSQL access for the RAG application's metadata foundation."""

import logging
import re
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Dict, Iterator, Optional
from uuid import UUID

import psycopg2
import psycopg2.extras
from psycopg2.extensions import connection as Connection

logger = logging.getLogger(__name__)
_IDENTIFIER = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


class Database:
    """Small direct-SQL PostgreSQL database wrapper."""

    @staticmethod
    def _as_uuid(value: UUID | str) -> UUID:
        return value if isinstance(value, UUID) else UUID(str(value))

    def __init__(self, connection_string: str, schema: Optional[str] = None):
        self.connection_string = connection_string
        self.schema = schema
        self._conn: Optional[Connection] = None

    def connect(self) -> None:
        if self._conn is None or self._conn.closed:
            self._conn = psycopg2.connect(
                self.connection_string,
                cursor_factory=psycopg2.extras.RealDictCursor,
            )
            if self.schema:
                if not _IDENTIFIER.fullmatch(self.schema):
                    self.close()
                    raise ValueError("schema must be a valid PostgreSQL identifier")
                with self._conn.cursor() as cursor:
                    cursor.execute("SET search_path TO \"%s\", public" % self.schema)
                self._conn.commit()

    def close(self) -> None:
        if self._conn and not self._conn.closed:
            self._conn.close()

    @contextmanager
    def transaction(self) -> Iterator[Any]:
        self.connect()
        assert self._conn is not None
        with self._conn.cursor() as cursor:
            try:
                yield cursor
                self._conn.commit()
            except Exception:
                self._conn.rollback()
                raise

    def initialize_schema(self, schema_path: Optional[Path] = None) -> None:
        schema_path = schema_path or Path(__file__).with_name("db_schema.sql")
        with self.transaction() as cursor:
            cursor.execute(schema_path.read_text(encoding="utf-8"))

    def health_check(self) -> bool:
        try:
            with self.transaction() as cursor:
                cursor.execute("SELECT 1 AS healthy")
                return cursor.fetchone()["healthy"] == 1
        except psycopg2.Error:
            logger.exception("Database health check failed")
            return False

    def insert_document(
        self, filename: str, sha256: str, file_path: str,
        page_count: Optional[int] = None, block_count: int = 0,
        status: str = "pending",
    ) -> UUID:
        with self.transaction() as cursor:
            cursor.execute(
                """
                INSERT INTO documents
                    (filename, sha256, file_path, page_count, block_count, status)
                VALUES (%s, %s, %s, %s, %s, %s) RETURNING id
                """,
                (filename, sha256, file_path, page_count, block_count, status),
            )
            return self._as_uuid(cursor.fetchone()["id"])

    def insert_page(self, document_id: UUID, page_number: int) -> UUID:
        with self.transaction() as cursor:
            cursor.execute(
                "INSERT INTO pages (document_id, page_number) VALUES (%s, %s) RETURNING id",
                (document_id, page_number),
            )
            return self._as_uuid(cursor.fetchone()["id"])

    def insert_block(
        self, page_id: UUID, block_type: str, doc_order: int,
        content_text: Optional[str] = None,
        table_structure: Optional[Dict[str, Any]] = None,
        bounding_box: Optional[list[float]] = None,
        artifact_path: Optional[str] = None,
        faiss_sequence: Optional[int] = None,
    ) -> UUID:
        with self.transaction() as cursor:
            cursor.execute(
                """
                INSERT INTO blocks
                    (page_id, block_type, content_text, table_structure,
                     bounding_box, artifact_path, faiss_sequence, doc_order)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
                """,
                (
                    page_id, block_type, content_text,
                    psycopg2.extras.Json(table_structure)
                    if table_structure is not None else None,
                    bounding_box, artifact_path, faiss_sequence, doc_order,
                ),
            )
            return self._as_uuid(cursor.fetchone()["id"])

    def insert_conversation(self, metadata: Optional[Dict[str, Any]] = None) -> UUID:
        with self.transaction() as cursor:
            cursor.execute(
                "INSERT INTO conversations (metadata) VALUES (%s) RETURNING id",
                (psycopg2.extras.Json(metadata or {}),),
            )
            return self._as_uuid(cursor.fetchone()["id"])

    def insert_message(
        self, conversation_id: UUID, role: str, content: str,
        original_query: Optional[str] = None,
        resolved_query: Optional[str] = None,
        citation_metadata: Optional[Dict[str, Any]] = None,
    ) -> UUID:
        with self.transaction() as cursor:
            cursor.execute(
                """
                INSERT INTO messages
                    (conversation_id, role, content, original_query,
                     resolved_query, citation_metadata)
                VALUES (%s, %s, %s, %s, %s, %s) RETURNING id
                """,
                (
                    conversation_id, role, content, original_query,
                    resolved_query, psycopg2.extras.Json(citation_metadata or {}),
                ),
            )
            return self._as_uuid(cursor.fetchone()["id"])