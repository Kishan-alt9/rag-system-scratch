import unittest
from unittest.mock import patch

from src.pipeline import MAX_CONVERSATION_TURNS, RAGPipeline


class ConversationTests(unittest.TestCase):
    def setUp(self):
        self.pipeline = RAGPipeline([], object())
        self.results = [{
            "document": "guide.pdf",
            "page": 1,
            "chunk_id": "guide.pdf:1:0",
            "text": "The topic is useful.",
        }]

    @patch("src.retriever.retrieve")
    @patch("src.generator.generate_answer")
    def test_new_conversation_returns_id_and_records_turn(self, mock_generate, mock_retrieve):
        mock_retrieve.return_value = self.results
        mock_generate.return_value = "The answer is useful [S1]."

        result = self.pipeline.ask("What is the topic?")

        self.assertTrue(result["conversation_id"])
        self.assertEqual(result["answer"], "The answer is useful [S1].")
        self.assertEqual(len(self.pipeline._conversations[result["conversation_id"]]), 1)

    @patch("src.retriever.retrieve")
    @patch("src.generator.generate_answer")
    def test_two_turn_follow_up_uses_previous_topic(self, mock_generate, mock_retrieve):
        mock_retrieve.return_value = self.results
        mock_generate.side_effect = ["It is useful [S1].", "Its advantages are listed [S1]."]

        first = self.pipeline.ask("What is the topic?", "conversation-a")
        self.pipeline.ask("What are its advantages?", first["conversation_id"])

        second_query = mock_retrieve.call_args_list[1].args[0]
        self.assertIn("What is the topic?", second_query)
        self.assertIn("What are its advantages?", second_query)
        self.assertEqual(mock_generate.call_args_list[1].args[2][0]["question"], "What is the topic?")

    @patch("src.retriever.retrieve")
    @patch("src.generator.generate_answer")
    def test_conversations_are_isolated(self, mock_generate, mock_retrieve):
        mock_retrieve.return_value = self.results
        mock_generate.return_value = "Answer [S1]."

        self.pipeline.ask("Tell me about MQTT.", "conversation-a")
        self.pipeline.ask("Tell me about CoAP.", "conversation-b")
        self.pipeline.ask("What are its advantages?", "conversation-a")

        follow_up_query = mock_retrieve.call_args_list[2].args[0]
        self.assertIn("MQTT", follow_up_query)
        self.assertNotIn("CoAP", follow_up_query)

    @patch("src.retriever.retrieve")
    @patch("src.generator.generate_answer")
    def test_history_is_bounded(self, mock_generate, mock_retrieve):
        mock_retrieve.return_value = self.results
        mock_generate.return_value = "Answer [S1]."

        for index in range(MAX_CONVERSATION_TURNS + 2):
            self.pipeline.ask(f"Question {index}", "bounded")

        history = self.pipeline._conversations["bounded"]
        self.assertLessEqual(len(history), MAX_CONVERSATION_TURNS)
        self.assertEqual(history[-1]["question"], f"Question {MAX_CONVERSATION_TURNS + 1}")

    @patch("src.retriever.retrieve")
    @patch("src.generator.generate_answer")
    def test_question_without_conversation_id_remains_compatible(self, mock_generate, mock_retrieve):
        mock_retrieve.return_value = self.results
        mock_generate.return_value = "Answer [S1]."

        result = self.pipeline.ask("What is this?")

        self.assertIn("answer", result)
        self.assertIn("sources", result)
        self.assertIn("citation_validation", result)
        self.assertTrue(result["conversation_id"])

    @patch("src.retriever.retrieve")
    @patch("src.generator.generate_answer")
    def test_reset_conversation_clears_history(self, mock_generate, mock_retrieve):
        mock_retrieve.return_value = self.results
        mock_generate.return_value = "Answer [S1]."

        self.pipeline.ask("What is this?", "resettable")

        self.assertTrue(self.pipeline.reset_conversation("resettable"))
        self.assertFalse(self.pipeline.reset_conversation("resettable"))
        self.assertNotIn("resettable", self.pipeline._conversations)


if __name__ == "__main__":
    unittest.main()
