import unittest
from unittest.mock import patch

from fastapi import HTTPException

import api


class ApiInitializationTests(unittest.TestCase):
    def tearDown(self):
        api.app.state.pipeline = None
        api.app.state.pipeline_error = None

    @patch("api.load_chunks", side_effect=RuntimeError("stored index is unreadable"))
    def test_ask_returns_controlled_error_when_pipeline_initialization_fails(self, mock_load_chunks):
        api.app.state.pipeline = None

        api.reload_pipeline()

        self.assertIsNone(api.app.state.pipeline)
        self.assertIsInstance(api.app.state.pipeline_error, RuntimeError)
        with self.assertRaisesRegex(HTTPException, "RAG pipeline/index is unavailable") as context:
            api.ask_question(api.QuestionRequest(question="What is this?"))

        self.assertEqual(context.exception.status_code, 500)
        self.assertIn("stored index is unreadable", context.exception.detail)
        mock_load_chunks.assert_called()


if __name__ == "__main__":
    unittest.main()
