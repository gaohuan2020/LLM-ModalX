import unittest
from unittest.mock import Mock, patch
from chains import (
    build_retrieval_grader_chain,
    build_rag_chain,
    build_hallucination_grader_chain,
    build_answer_grader_chain,
    build_question_rewriter_chain,
)
from data_model import GradeDocuments, GradeHallucinations, GradeAnswer

class TestChains(unittest.TestCase):
    def setUp(self):
        self.mock_llm = Mock()
        self.mock_llm.with_structured_output.return_value = Mock()

    @patch('chains.llm')
    def test_build_retrieval_grader_chain(self, mock_llm):
        # Arrange
        mock_llm.with_structured_output.return_value = Mock()
        
        # Act
        chain = build_retrieval_grader_chain()
        
        # Assert
        self.assertIsNotNone(chain)
        mock_llm.with_structured_output.assert_called_once_with(GradeDocuments)

    @patch('chains.hub')
    @patch('chains.llm')
    def test_build_rag_chain(self, mock_llm, mock_hub):
        # Arrange
        mock_hub.pull.return_value = Mock()
        
        # Act
        chain = build_rag_chain()
        
        # Assert
        self.assertIsNotNone(chain)
        mock_hub.pull.assert_called_once_with("rlm/rag-prompt")

    @patch('chains.llm')
    def test_build_hallucination_grader_chain(self, mock_llm):
        # Arrange
        mock_llm.with_structured_output.return_value = Mock()
        
        # Act
        chain = build_hallucination_grader_chain()
        
        # Assert
        self.assertIsNotNone(chain)
        mock_llm.with_structured_output.assert_called_once_with(GradeHallucinations)

    @patch('chains.llm')
    def test_build_answer_grader_chain(self, mock_llm):
        # Arrange
        mock_llm.with_structured_output.return_value = Mock()
        
        # Act
        chain = build_answer_grader_chain()
        
        # Assert
        self.assertIsNotNone(chain)
        mock_llm.with_structured_output.assert_called_once_with(GradeAnswer)

    @patch('chains.llm')
    def test_build_question_rewriter_chain(self, mock_llm):
        # Arrange
        mock_llm.return_value = Mock()
        
        # Act
        chain = build_question_rewriter_chain()
        
        # Assert
        self.assertIsNotNone(chain)

    # Integration tests
    def test_retrieval_grader_chain_integration(self):
        chain = build_retrieval_grader_chain()
        result = chain.invoke({
            "document": "This is a test document about AI.",
            "question": "What is AI?"
        })
        self.assertIsInstance(result, GradeDocuments)

    def test_hallucination_grader_chain_integration(self):
        chain = build_hallucination_grader_chain()
        result = chain.invoke({
            "documents": "AI is a field of computer science.",
            "generation": "AI helps computers learn."
        })
        self.assertIsInstance(result, GradeHallucinations)

    def test_answer_grader_chain_integration(self):
        chain = build_answer_grader_chain()
        result = chain.invoke({
            "question": "What is AI?",
            "generation": "AI is artificial intelligence."
        })
        self.assertIsInstance(result, GradeAnswer)

    def test_question_rewriter_chain_integration(self):
        chain = build_question_rewriter_chain()
        result = chain.invoke({
            "question": "What is AI?"
        })
        self.assertIsInstance(result, str)

if __name__ == '__main__':
    unittest.main() 