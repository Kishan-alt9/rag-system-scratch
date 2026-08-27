import os
from uuid import uuid4

import psycopg2
import pytest

from src.database import Database


TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/rag_test",
)


def pytest_configure(config):
    config.addinivalue_line(
        "markers", "requires_postgres: mark test as requiring PostgreSQL"
    )


@pytest.fixture(scope="session")
def postgres_available():
    try:
        with psycopg2.connect(TEST_DATABASE_URL):
            return True
    except psycopg2.Error:
        return False


@pytest.fixture(scope="function")
def db(postgres_available):
    if not postgres_available:
        pytest.skip("PostgreSQL is not available; set TEST_DATABASE_URL")

    admin = psycopg2.connect(TEST_DATABASE_URL)
    schema = f"test_{uuid4().hex}"
    with admin.cursor() as cursor:
        cursor.execute(f'CREATE SCHEMA "{schema}"')
    admin.commit()
    admin.close()

    database = Database(TEST_DATABASE_URL, schema=schema)
    database.initialize_schema()
    yield database
    database.close()

    admin = psycopg2.connect(TEST_DATABASE_URL)
    with admin.cursor() as cursor:
        cursor.execute(f'DROP SCHEMA IF EXISTS "{schema}" CASCADE')
    admin.commit()
    admin.close()