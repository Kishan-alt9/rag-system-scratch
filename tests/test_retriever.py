import unittest
from unittest.mock import patch

import numpy as np

from src.retriever import retrieve


class FakeIndex:
    def __init__(self, ntotal, distances, indices):
        self.ntotal = ntotal
        self.distances = np.asarray(distances, dtype="float32")
        self.indices = np.asarray(indices, dtype="int64")
        self.requested_k = None

    def search(self, query_embedding, k):
        self.requested_k = k
        return self.distances[:, :k], self.indices[:, :k]


class RetrieverTests(unittest.TestCase):
    def setUp(self):
        self.chunks = [
            {"document": "guide.pdf", "page": 1, "chunk_id": "guide.pdf:1:0", "text": "first"},
            {"document": "guide.pdf", "page": 2, "chunk_id": "guide.pdf:2:0", "text": "second"},
            {"document": "other.pdf", "page": 1, "chunk_id": "other.pdf:1:0", "text": "other"},
        ]

    @patch("src.retriever.embed")
    def test_document_scope_searches_full_index_and_preserves_faiss_order(self, mock_embed):
        mock_embed.return_value = {"embeddings": [[0.1, 0.2]]}
        chunks = [
            {"document": "other.pdf", "page": 1, "chunk_id": str(index), "text": str(index)}
            for index in range(20)
        ]
        chunks[15]["document"] = "target.pdf"
        index = FakeIndex(
            20,
            [list(range(20))],
            [list(range(20))],
        )

        results = retrieve("question", index, chunks, top_k=1, document_name="target.pdf")

        self.assertEqual(index.requested_k, 20)
        self.assertEqual([result["chunk_id"] for result in results], ["15"])

    @patch("src.retriever.embed")
    def test_document_scope_filters_results_without_reordering(self, mock_embed):
        mock_embed.return_value = {"embeddings": [[0.1, 0.2]]}
        index = FakeIndex(3, [[0.1, 0.2, 0.3]], [[0, 2, 1]])

        results = retrieve("question", index, self.chunks, top_k=2, document_name="guide.pdf")

        self.assertEqual([result["chunk_id"] for result in results], ["guide.pdf:1:0", "guide.pdf:2:0"])

    @patch("src.retriever.embed")
    def test_empty_index_returns_no_results(self, mock_embed):
        index = FakeIndex(0, [[]], [[]])

        self.assertEqual(retrieve("question", index, [], top_k=3), [])
        mock_embed.assert_not_called()

    @patch("src.retriever.embed")
    def test_empty_search_result_returns_no_results(self, mock_embed):
        mock_embed.return_value = {"embeddings": [[0.1, 0.2]]}
        index = FakeIndex(2, [[], []], [[], []])

        self.assertEqual(retrieve("question", index, self.chunks[:2], top_k=3), [])

    @patch("src.retriever.embed")
    def test_nonpositive_top_k_returns_no_results(self, mock_embed):
        index = FakeIndex(3, [[0.1, 0.2, 0.3]], [[0, 1, 2]])

        self.assertEqual(retrieve("question", index, self.chunks, top_k=0), [])
        self.assertEqual(retrieve("question", index, self.chunks, top_k=-1), [])
        mock_embed.assert_not_called()

    @patch("src.retriever.embed")
    def test_invalid_faiss_indices_are_ignored(self, mock_embed):
        mock_embed.return_value = {"embeddings": [[0.1, 0.2]]}
        index = FakeIndex(3, [[0.1, 0.2, 0.3]], [[-1, 99, 1]])

        results = retrieve("question", index, self.chunks, top_k=3)

        self.assertEqual([result["chunk_id"] for result in results], ["guide.pdf:2:0"])

    @patch("src.retriever.embed")
    def test_faiss_chunk_mismatch_raises_clear_error(self, mock_embed):
        index = FakeIndex(2, [[0.1, 0.2]], [[0, 1]])

        with self.assertRaisesRegex(ValueError, "FAISS index and chunks are out of sync"):
            retrieve("question", index, self.chunks[:1], top_k=1)

        mock_embed.assert_not_called()


if __name__ == "__main__":
    unittest.main()
