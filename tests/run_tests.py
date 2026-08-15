import os
import shutil
import uuid
import pickle
import numpy as np
import sys
from pathlib import Path

# Provide a lightweight faiss stub if faiss is not installed so tests can run offline.
try:
    import faiss
except Exception:
    import types
    import numpy as _np

    faiss = types.SimpleNamespace()

    class IndexFlatL2:
        def __init__(self, d=0):
            self.d = d
            self.vectors = _np.empty((0, d), dtype="float32")

        def add(self, vecs):
            vecs = _np.asarray(vecs, dtype="float32")
            if self.vectors.size == 0:
                self.d = vecs.shape[1]
            self.vectors = _np.vstack([self.vectors, vecs])

        def reconstruct(self, i):
            return self.vectors[i]

        @property
        def ntotal(self):
            return self.vectors.shape[0]

    def write_index(index, path):
        # persist numpy array of vectors
        with open(path, "wb") as f:
            pickle.dump(getattr(index, "vectors", _np.empty((0, 0), dtype="float32")), f)

    def read_index(path):
        with open(path, "rb") as f:
            vecs = pickle.load(f)
        idx = IndexFlatL2(vecs.shape[1] if vecs.size else 0)
        idx.vectors = vecs
        return idx

    faiss.IndexFlatL2 = IndexFlatL2
    faiss.write_index = write_index
    faiss.read_index = read_index
    sys.modules["faiss"] = faiss

import src.indexer as indexer

TEST_BACKUP_DIR = Path("storage_backup")
STORAGE_DIR = Path("storage")


def backup_storage():
    if STORAGE_DIR.exists():
        if TEST_BACKUP_DIR.exists():
            shutil.rmtree(TEST_BACKUP_DIR)
        shutil.copytree(STORAGE_DIR, TEST_BACKUP_DIR)
        print(f"Backup created at {TEST_BACKUP_DIR}")
    else:
        print("No storage directory to backup.")


def ensure_embeddings_present():
    emb = indexer.load_embeddings()
    if emb is not None:
        print("embeddings.pkl already present")
        return True

    try:
        idx = indexer.load_index()
    except Exception as e:
        print(f"Failed to load FAISS index for reconstruction: {e}")
        return False

    if idx is None:
        print("No FAISS index to reconstruct embeddings from.")
        return False

    reconstructed = indexer._reconstruct_embeddings_from_faiss(idx)
    if reconstructed is None:
        print("Could not reconstruct embeddings from FAISS index")
        return False

    indexer.save_embeddings(reconstructed)
    print("Reconstructed embeddings from FAISS and saved embeddings.pkl")
    return True


def test1_invariants():
    print("TEST 1: Existing documents load successfully and invariants hold")
    chunks = indexer.load_chunks()
    embeddings = indexer.load_embeddings()
    idx = indexer.load_index()

    if embeddings is None:
        print("FAIL: embeddings.pkl missing")
        return False

    if len(chunks) != embeddings.shape[0]:
        print(f"FAIL: chunks ({len(chunks)}) != embeddings ({embeddings.shape[0]})")
        return False

    if idx is not None and idx.ntotal != embeddings.shape[0]:
        print(f"FAIL: FAISS ntotal ({idx.ntotal}) != embeddings ({embeddings.shape[0]})")
        return False

    print("PASS Test 1")
    return True


def create_dummy_pdf(path, text="Hello world"):
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    doc.save(str(path))
    doc.close()


def test2_upload_new_document():
    print("TEST 2: Upload a new document (monkeypatch embedder to avoid external calls)")
    from src import embedder, pdf_loader

    # monkeypatch embedder.create_embeddings
    orig_create_embeddings = embedder.create_embeddings

    def fake_create_embeddings(chunks):
        # assign deterministic embeddings per chunk
        for i, chunk in enumerate(chunks):
            chunk["embedding"] = np.ones(768, dtype="float32") * (i + 1)
        return chunks

    embedder.create_embeddings = fake_create_embeddings

    # create a dummy PDF
    upload_dir = Path("data/raw")
    upload_dir.mkdir(parents=True, exist_ok=True)
    fname = f"test_upload_{uuid.uuid4().hex}.pdf"
    p = upload_dir / fname
    create_dummy_pdf(p, text="This is a test upload")

    before_chunks = indexer.load_chunks()
    before_embeddings = indexer.load_embeddings()
    before_idx = indexer.load_index()

    try:
        indexer.index_pdf(p)
        # after
        after_chunks = indexer.load_chunks()
        after_embeddings = indexer.load_embeddings()
        after_idx = indexer.load_index()

        added_chunks = len(after_chunks) - len(before_chunks)
        added_embeddings = after_embeddings.shape[0] - before_embeddings.shape[0] if before_embeddings is not None else after_embeddings.shape[0]

        print(f"Added chunks: {added_chunks}, added embeddings: {added_embeddings}")

        if added_chunks <= 0 or added_embeddings <= 0:
            print("FAIL: no new chunks/embeddings added")
            return False

        if after_idx is None or after_idx.ntotal != after_embeddings.shape[0]:
            print("FAIL: FAISS ntotal mismatch after upload")
            return False

        # find the new document id in metadata
        metadata = indexer.load_metadata()
        ids = [d.get('id') for d in metadata.get('documents', [])]
        if not ids:
            print("FAIL: no metadata documents found after upload")
            return False

        print("PASS Test 2")
        return True
    except Exception as e:
        print("FAIL Test 2 with exception:", e)
        return False
    finally:
        embedder.create_embeddings = orig_create_embeddings


def test3_delete_new_document():
    print("TEST 3: Delete the newly uploaded document")
    metadata = indexer.load_metadata()
    if not metadata.get('documents'):
        print("No documents to delete")
        return False

    # pick the last document (likely the uploaded one)
    doc = metadata.get('documents')[-1]
    doc_id = doc.get('id')
    filename = doc.get('filename')

    before_chunks = indexer.load_chunks()
    before_embeddings = indexer.load_embeddings()

    try:
        indexer.delete_document(doc_id)
        after_chunks = indexer.load_chunks()
        after_embeddings = indexer.load_embeddings()

        # verify removed
        if any(c.get('document') == filename for c in after_chunks):
            print("FAIL: chunks for document still present")
            return False

        if after_embeddings.shape[0] != before_embeddings.shape[0] - (len([c for c in before_chunks if c.get('document') == filename])):
            print("FAIL: embeddings count did not decrease correctly")
            return False

        print("PASS Test 3")
        return True
    except Exception as e:
        print("FAIL Test 3:", e)
        return False


def test4_reindex_document():
    print("TEST 4: Re-index an existing document (monkeypatch embedder)")
    from src import embedder

    # pick an existing document to reindex (first one)
    metadata = indexer.load_metadata()
    if not metadata.get('documents'):
        print("No documents to reindex")
        return False

    doc = metadata.get('documents')[0]
    doc_id = doc.get('id')
    filename = doc.get('filename')

    # create a replacement PDF
    upload_dir = Path("data/raw")
    new_name = f"repl_{uuid.uuid4().hex}.pdf"
    p = upload_dir / new_name
    create_dummy_pdf(p, text="Replacement content for reindex test")

    # monkeypatch embedding to produce distinct vectors
    orig_create_embeddings = embedder.create_embeddings

    def fake_create_embeddings(chunks):
        for i, chunk in enumerate(chunks):
            chunk['embedding'] = np.ones(768, dtype='float32') * (i + 1000)
        return chunks

    embedder.create_embeddings = fake_create_embeddings

    before_chunks = indexer.load_chunks()
    before_embeddings = indexer.load_embeddings().copy()

    try:
        indexer.reindex_document(doc_id, p)
        after_chunks = indexer.load_chunks()
        after_embeddings = indexer.load_embeddings()

        # ensure other documents' embeddings are unchanged (compare subset indices)
        # Find indices of chunks that belonged to the reindexed document before
        before_doc_indices = [i for i, c in enumerate(before_chunks) if c.get('document') == filename]
        # ensure none of those chunks remain
        if any(c.get('document') == filename for c in after_chunks):
            print("FAIL: old chunks for document still present")
            return False

        # other docs should have same embeddings at their positions (positional invariant)
        # Build list of retained indices before reindex
        retained_before_indices = [i for i, c in enumerate(before_chunks) if c.get('document') != filename]
        retained_after_indices = list(range(len(retained_before_indices)))

        # compare embeddings for retained positions
        if not np.allclose(before_embeddings[retained_before_indices], after_embeddings[retained_after_indices]):
            print("FAIL: embeddings for unaffected documents changed")
            return False

        print("PASS Test 4")
        return True
    except Exception as e:
        print("FAIL Test 4:", e)
        return False
    finally:
        embedder.create_embeddings = orig_create_embeddings


def test5_delete_nonexistent():
    print("TEST 5: Delete nonexistent document should raise DocumentNotFoundError")
    fake_id = "nonexistent-id-12345"
    try:
        indexer.delete_document(fake_id)
        print("FAIL: delete did not raise for nonexistent document")
        return False
    except indexer.DocumentNotFoundError:
        print("PASS Test 5")
        return True
    except Exception as e:
        print("FAIL Test 5 unexpected exception:", e)
        return False


def test6_index_failure_atomicity():
    print("TEST 6: Simulate indexing failure and ensure persisted state remains intact")
    from src import vector_store, embedder

    # backup current persisted files' mtimes and sizes
    files = [STORAGE_DIR / 'chunks.pkl', STORAGE_DIR / 'embeddings.pkl', STORAGE_DIR / 'faiss.index', STORAGE_DIR / 'metadata.json']
    snapshots = {}
    for f in files:
        if f.exists():
            snapshots[str(f)] = (f.stat().st_mtime, f.stat().st_size)

    # monkeypatch create_vector_store to raise
    orig_create_vector_store = vector_store.create_vector_store

    def failing_create_vector_store(chunks):
        raise RuntimeError("Simulated failure during vector store creation")

    vector_store.create_vector_store = failing_create_vector_store

    # create dummy pdf
    upload_dir = Path("data/raw")
    fname = f"test_fail_{uuid.uuid4().hex}.pdf"
    p = upload_dir / fname
    create_dummy_pdf(p, text="This will trigger a simulated failure")

    # monkeypatch embedder to not call external service
    orig_create_embeddings = embedder.create_embeddings

    def fake_create_embeddings(chunks):
        for i, chunk in enumerate(chunks):
            chunk['embedding'] = np.ones(768, dtype='float32') * 2
        return chunks

    embedder.create_embeddings = fake_create_embeddings

    try:
        try:
            indexer.index_pdf(p)
            print("FAIL: expected index_pdf to raise due to simulated failure")
            return False
        except Exception:
            # expected
            pass

        # check persisted files unchanged
        for f in files:
            if f.exists():
                mtime, size = f.stat().st_mtime, f.stat().st_size
                orig = snapshots.get(str(f))
                if orig and (abs(orig[0] - mtime) > 1e-6 or orig[1] != size):
                    print(f"FAIL: file {f} changed during failed indexing")
                    return False

        print("PASS Test 6")
        return True
    finally:
        vector_store.create_vector_store = orig_create_vector_store
        embedder.create_embeddings = orig_create_embeddings


if __name__ == '__main__':
    backup_storage()
    ok = ensure_embeddings_present()
    if not ok:
        print("Migration requirement not met; aborting tests.")
    else:
        results = []
        results.append(test1_invariants())
        results.append(test2_upload_new_document())
        results.append(test3_delete_new_document())
        results.append(test4_reindex_document())
        results.append(test5_delete_nonexistent())
        results.append(test6_index_failure_atomicity())

        passed = sum(1 for r in results if r)
        total = len(results)
        print(f"\n{passed}/{total} tests passed")
