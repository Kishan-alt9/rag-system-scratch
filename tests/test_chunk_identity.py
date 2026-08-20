import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

import numpy as np

import src.indexer as indexer
from src.retriever import retrieve


class FakeIndex:
    ntotal = 2

    def search(self, query_embedding, k):
        distances = np.array([[0.2, 0.4]], dtype="float32")
        indices = np.array([[0, 1]], dtype="int64")
        return distances[:, :k], indices[:, :k]


class ChunkIdentityTests(unittest.TestCase):
    def test_persisted_chunks_have_unique_deterministic_ids(self):
        chunks = [
            {"document": "guide.pdf", "page": 2, "text": "first", "embedding": [1.0]},
            {"document": "guide.pdf", "page": 2, "text": "second", "embedding": [2.0]},
            {"document": "guide.pdf", "page": 3, "text": "third", "embedding": [3.0]},
        ]

        with tempfile.TemporaryDirectory() as temp_dir:
            storage_dir = Path(temp_dir)
            with patch.object(indexer, "STORAGE_DIR", storage_dir), patch.object(
                indexer, "CHUNKS_PATH", storage_dir / "chunks.pkl"
            ):
                indexer.save_chunks(chunks)
                persisted_chunks = indexer.load_chunks()

        chunk_ids = [chunk["chunk_id"] for chunk in persisted_chunks]
        self.assertEqual(chunk_ids, ["guide.pdf:2:0", "guide.pdf:2:1", "guide.pdf:3:0"])
        self.assertEqual(len(chunk_ids), len(set(chunk_ids)))
        self.assertEqual([chunk["text"] for chunk in persisted_chunks], ["first", "second", "third"])
        self.assertEqual([chunk["embedding"] for chunk in persisted_chunks], [[1.0], [2.0], [3.0]])

    @patch("src.retriever.embed")
    @patch("src.retriever._get_reranker")
    def test_retrieval_returns_expected_chunk_metadata(self, mock_get_reranker, mock_embed):
        mock_embed.return_value = {"embeddings": [[0.1, 0.2]]}
        reranker = Mock()
        reranker.predict.return_value = np.array([0.1, 0.9], dtype="float32")
        mock_get_reranker.return_value = reranker
        chunks = [
            {
                "document": "guide.pdf",
                "page": 2,
                "chunk_id": "guide.pdf:2:0",
                "text": "first",
                "embedding": [1.0, 0.0],
            },
            {
                "document": "guide.pdf",
                "page": 2,
                "chunk_id": "guide.pdf:2:1",
                "text": "second",
                "embedding": [0.0, 1.0],
            },
        ]

        results = retrieve("question", FakeIndex(), chunks, top_k=1, candidate_k=2)

        self.assertEqual(results[0]["document"], "guide.pdf")
        self.assertEqual(results[0]["page"], 2)
        self.assertEqual(results[0]["chunk_id"], "guide.pdf:2:1")
        self.assertEqual(results[0]["text"], "second")
        self.assertAlmostEqual(results[0]["distance"], 0.4)


if __name__ == "__main__":
    unittest.main()