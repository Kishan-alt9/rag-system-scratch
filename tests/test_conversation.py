import unittest
from unittest.mock import patch

from src.pipeline import MAX_CONVERSATION_TURNS, RAGPipeline, _extract_points


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
        self.assertEqual(second_query, "What are What is the topic advantages?")
        self.assertNotIn("Conversation context:", second_query)
        self.assertEqual(mock_generate.call_args_list[1].args[2][0]["question"], "What is the topic?")

    @patch("src.retriever.retrieve")
    @patch("src.generator.generate_answer")
    def test_protocol_ordinals_resolve_from_previous_answer(self, mock_generate, mock_retrieve):
        mock_retrieve.return_value = self.results
        mock_generate.side_effect = [
            "1. MQTT [S1]\n2. CoAP [S1]",
            "MQTT is a protocol [S1].",
            "CoAP is a protocol [S1].",
        ]

        first = self.pipeline.ask(
            "What are the different protocols in Module 1 Notes?",
            "protocols"
        )
        second = self.pipeline.ask("Can you explain the first one?", first["conversation_id"])
        third = self.pipeline.ask("What about the second one?", second["conversation_id"])

        self.assertEqual(first["conversation_id"], second["conversation_id"])
        self.assertEqual(second["conversation_id"], third["conversation_id"])
        self.assertEqual(mock_retrieve.call_args_list[1].args[0], "Can you explain MQTT?")
        self.assertEqual(mock_retrieve.call_args_list[2].args[0], "What about CoAP?")
        self.assertEqual(mock_generate.call_args_list[1].kwargs["resolved_question"], "Can you explain MQTT?")
        self.assertEqual(mock_generate.call_args_list[2].kwargs["resolved_question"], "What about CoAP?")

    @patch("src.retriever.retrieve")
    @patch("src.generator.generate_answer")
    def test_first_advantage_resolves_from_previous_answer(self, mock_generate, mock_retrieve):
        mock_retrieve.return_value = self.results
        mock_generate.side_effect = [
            "1. Lower cost [S1]\n2. Better reliability [S1]",
            "Lower cost is an advantage [S1].",
        ]

        first = self.pipeline.ask("What are the main advantages?", "advantages")
        self.pipeline.ask(
            "Can you explain the first one in more detail?",
            first["conversation_id"]
        )

        self.assertEqual(
            mock_retrieve.call_args_list[1].args[0],
            "Can you explain Lower cost in more detail?"
        )

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

    def test_extracts_explicit_protocol_list(self):
        self.assertEqual(
            _extract_points("The protocols include MQTT, CoAP, HTTP, AMQP, and XMPP."),
            ["MQTT", "CoAP", "HTTP", "AMQP", "XMPP"]
        )

    def test_extracts_explicit_advantages_list(self):
        self.assertEqual(
            _extract_points("The advantages include speed, clarity, and productivity."),
            ["speed", "clarity", "productivity"]
        )

    def test_extracts_explicit_types_list(self):
        self.assertEqual(
            _extract_points("The types are waterfall, spiral, and agile."),
            ["waterfall", "spiral", "agile"]
        )

    def test_extracts_explicit_stages_list(self):
        self.assertEqual(
            _extract_points("The stages mentioned are planning, design, implementation, and testing."),
            ["planning", "design", "implementation", "testing"]
        )

    def test_extracts_numbered_list_before_explicit_list(self):
        self.assertEqual(_extract_points("1. MQTT\n2. CoAP"), ["MQTT", "CoAP"])

    def test_extracts_bulleted_list_before_explicit_list(self):
        self.assertEqual(_extract_points("- MQTT\n- CoAP"), ["MQTT", "CoAP"])

    def test_rejects_ordinary_comma_separated_prose(self):
        self.assertEqual(_extract_points("The system is fast, reliable, and scalable."), [])
        self.assertEqual(_extract_points("This system uses a broker, clients, and topics for messaging."), [])
        self.assertEqual(_extract_points("The document discusses speed, reliability, and performance."), [])

    def test_discards_trailing_and_others(self):
        self.assertEqual(
            _extract_points(
                "The different protocols mentioned in Module 1 Notes are MQTT, CoAP, HTTP, AMQP, XMPP, and others related to IoT communication [S1]."
            ),
            ["MQTT", "CoAP", "HTTP", "AMQP", "XMPP"]
        )

    def test_strips_citation_markers(self):
        self.assertEqual(
            _extract_points("The types are waterfall [S1], spiral [S2], and agile [S3]."),
            ["waterfall", "spiral", "agile"]
        )

    def test_rejects_nested_explanatory_such_as_phrase(self):
        self.assertEqual(
            _extract_points(
                "Messages are categorized into different types, such as CONNECT, CONNACK, and PUBLISH."
            ),
            []
        )


if __name__ == "__main__":
    unittest.main()
