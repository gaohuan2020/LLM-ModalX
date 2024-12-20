import unittest
from unittest.mock import Mock, MagicMock
from langchain.schema import Document
from nodes import RAGNodes

class TestRAGNodes(unittest.TestCase):
    def setUp(self):
        # 创建所需的mock对象
        self.retriever = Mock()
        self.rag_chain = Mock()
        self.question_rewriter = Mock()
        self.retrieval_grader = Mock()
        
        # 初始化RAGNodes实例
        self.rag_nodes = RAGNodes(
            self.retriever,
            self.rag_chain,
            self.question_rewriter,
            self.retrieval_grader
        )

    def test_retrieve(self):
        # 准备测试数据
        test_question = "测试问题"
        mock_documents = [Document(page_content="测试文档1"), Document(page_content="测试文档2")]
        self.retriever.invoke.return_value = mock_documents

        # 执行测试
        state = {"question": test_question}
        result = self.rag_nodes.retrieve(state)

        # 验证结果
        self.retriever.invoke.assert_called_once_with(test_question)
        self.assertEqual(result["documents"], mock_documents)
        self.assertEqual(result["question"], test_question)

    def test_generate(self):
        # 准备测试数据
        test_question = "测试问题"
        test_documents = [Document(page_content="测试文档")]
        test_generation = "生成的答案"
        self.rag_chain.invoke.return_value = test_generation

        # 执行测试
        state = {"question": test_question, "documents": test_documents}
        result = self.rag_nodes.generate(state)

        # 验证结果
        self.rag_chain.invoke.assert_called_once_with({
            "context": test_documents,
            "question": test_question
        })
        self.assertEqual(result["generation"], test_generation)
        self.assertEqual(result["documents"], test_documents)
        self.assertEqual(result["question"], test_question)

    def test_transform_query(self):
        # 准备测试数据
        test_question = "测试问题"
        test_documents = [Document(page_content="测试文档")]
        better_question = "改进后的问题"
        self.question_rewriter.invoke.return_value = better_question

        # 执行测试
        state = {"question": test_question, "documents": test_documents}
        result = self.rag_nodes.transform_query(state)

        # 验证结果
        self.question_rewriter.invoke.assert_called_once_with({"question": test_question})
        self.assertEqual(result["question"], better_question)
        self.assertEqual(result["documents"], test_documents)

    def test_grade_documents(self):
        # 准备测试数据
        test_question = "测试问题"
        test_documents = [
            Document(page_content="相关文档"),
            Document(page_content="不相关文档")
        ]
        
        # 设置mock对象的行为
        self.retrieval_grader.invoke.side_effect = [
            MagicMock(binary_score="yes"),  # 第一个文档相关
            MagicMock(binary_score="no")    # 第二个文档不相关
        ]

        # 执行测试
        state = {"question": test_question, "documents": test_documents}
        result = self.rag_nodes.grade_documents(state)

        # 验证结果
        self.assertEqual(len(result["documents"]), 1)  # 只有一个文档应该被保留
        self.assertEqual(result["documents"][0].page_content, "相关文档")
        self.assertEqual(result["question"], test_question)
        self.assertEqual(self.retrieval_grader.invoke.call_count, 2)

if __name__ == '__main__':
    unittest.main() 