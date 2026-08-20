import unittest
from unittest.mock import patch

from src.pipeline import RAGPipeline
from src.generator import validate_citations


class GenerationTests(unittest.TestCase):
    def test_valid_citations_are_recognized(self):
        result = validate_citations("The answer is supported [S1] and [S2].", ["S1", "S2"])

        self.assertEqual(result, {
            "valid": True,
            "cited_ids": ["S1", "S2"],
            "invalid_ids": []
        })

    def test_invalid_citation_is_reported_without_remapping(self):
        result = validate_citations("The answer is supported [S9].", ["S1"])

        self.assertEqual(result["cited_ids"], ["S9"])
        self.assertEqual(result["invalid_ids"], ["S9"])
        self.assertFalse(result["valid"])

    @patch("src.retriever.retrieve")
    def test_empty_retrieval_uses_fallback_without_generation(self, mock_retrieve):
        mock_retrieve.return_value = []
        pipeline = RAGPipeline([], object())

        with patch("src.generator.generate_answer") as mock_generate:
            result = pipeline.ask("What is this about?")

        mock_generate.assert_not_called()
        self.assertEqual(result["answer"], "I couldn't find the answer in the provided document.")
        self.assertEqual(result["sources"], [])
        self.assertEqual(result["citation_validation"]["cited_ids"], [])
        self.assertTrue(result["citation_validation"]["valid"])

    @patch("src.retriever.retrieve")
    def test_response_keeps_backward_compatible_fields(self, mock_retrieve):
        mock_retrieve.return_value = [{
            "document": "guide.pdf",
            "page": 4,
            "chunk_id": "guide.pdf:4:0",
            "text": "The answer is forty-two."
        }]
        pipeline = RAGPipeline([], object())

        with patch("src.generator.generate_answer", return_value="The answer is forty-two [S1]."):
            result = pipeline.ask("What is the answer?")

        self.assertIn("answer", result)
        self.assertIn("sources", result)
        self.assertEqual(result["sources"][0]["document"], "guide.pdf")
        self.assertEqual(result["sources"][0]["page"], 4)
        self.assertEqual(result["sources"][0]["citation_id"], "S1")
        self.assertTrue(result["citation_validation"]["valid"])

    def test_citation_correctness_id_source_of_truth(self):
        # Verify that validation parses citation ids (like S2, S1) directly as the source of truth,
        # rather than guessing them by list position
        answer = "First fact [S2]. Second fact [S1]."
        source_ids = ["S1", "S2"]
        result = validate_citations(answer, source_ids)
        self.assertTrue(result["valid"])
        self.assertEqual(result["cited_ids"], ["S2", "S1"])

    @patch("src.retriever.retrieve")
    def test_stale_state_prevention_on_no_answer(self, mock_retrieve):
        # Verify that if no chunks are retrieved, the pipeline returns exactly the fallback string
        # and has zero sources, preventing stale context leakage
        mock_retrieve.return_value = []
        pipeline = RAGPipeline([], object())
        result = pipeline.ask("A question with no context")
        self.assertEqual(result["answer"], "I couldn't find the answer in the provided document.")
        self.assertEqual(result["sources"], [])


if __name__ == "__main__":
    unittest.main()