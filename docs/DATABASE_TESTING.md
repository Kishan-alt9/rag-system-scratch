# PostgreSQL Test Database Setup

## Phase 1A.1: Database Layer Testing

The database layer (`src/database.py`) requires a running PostgreSQL instance for testing.

## Quick Setup with Docker

```bash
# Start PostgreSQL test database
docker run --name rag-test-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=rag_test \
  -p 5432:5432 \
  -d postgres:15

# Run tests
export TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rag_test"
pytest tests/test_database.py -v

# Stop and remove container
docker stop rag-test-db
docker rm rag-test-db
```

## Manual PostgreSQL Setup

If you have PostgreSQL installed locally:

```bash
# Create test database
createdb rag_test

# Set connection string
export TEST_DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/rag_test"

# Run tests
pytest tests/test_database.py -v
```

## Windows Setup

```powershell
# Using PostgreSQL for Windows
createdb -U postgres rag_test

# Set environment variable
$env:TEST_DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/rag_test"

# Run tests
pytest tests/test_database.py -v
```

## Test Behavior

- If PostgreSQL is **not available**, tests in `test_database.py` will be **automatically skipped**
- Each test function creates a unique PostgreSQL schema and drops it during teardown
- Set `TEST_DATABASE_URL` to a dedicated test database; it is **not** the production database
- The database layer uses direct `psycopg2` SQL and does not provide a SQLite fallback

## Verifying Installation

Check if PostgreSQL is accessible:

```bash
python -c "import psycopg2; conn = psycopg2.connect('postgresql://postgres:postgres@localhost:5432/postgres'); print('✓ PostgreSQL available'); conn.close()"
```

## Alternative: Cloud PostgreSQL

You can also use a cloud PostgreSQL instance (e.g., Supabase, ElephantSQL, AWS RDS):

```bash
export TEST_DATABASE_URL="postgresql://user:pass@host.example.com:5432/dbname"
pytest tests/test_database.py -v
```

## Running Without PostgreSQL

The test suite will skip database tests if PostgreSQL is unavailable. To run other tests:

```bash
pytest tests/ -v -k "not test_database"
```
