import unittest
from unittest.mock import Mock, patch
from graph import RAGGraph, GraphState
from langgraph.graph import END, START
from typing import List


class TestRAGGraph(unittest.TestCase):

    def setUp(self):
        # 创建mock的VectorStore
        self.mock_retriever = Mock()
        self.mock_vector_store = Mock()
        self.mock_vector_store.get_retriever.return_value = self.mock_retriever

        # 使用patch来模拟build_*_chain函数
        self.patches = [
            patch('graph.build_rag_chain'),
            patch('graph.build_question_rewriter_chain'),
            patch('graph.build_retrieval_grader_chain')
        ]

        # 启动所有patches并存储mock对象
        self.mock_chains = [patcher.start() for patcher in self.patches]
        self.mock_rag_chain = self.mock_chains[0].return_value
        self.mock_question_rewriter = self.mock_chains[1].return_value
        self.mock_retrieval_grader = self.mock_chains[2].return_value

        # 初始化RAGGraph
        self.rag_graph = RAGGraph(self.mock_vector_store)

    def tearDown(self):
        # 停止所有patches
        for patcher in self.patches:
            patcher.stop()

    def test_init(self):
        """测试RAGGraph的初始化"""
        # 验证所有必要的chain都被正确构建
        self.mock_chains[0].assert_called_once()  # build_rag_chain
        self.mock_chains[1].assert_called_once(
        )  # build_question_rewriter_chain
        self.mock_chains[2].assert_called_once(
        )  # build_retrieval_grader_chain

        # 验证vector_store.get_retriever被调用
        self.mock_vector_store.get_retriever.assert_called_once()

    def test_graph_structure(self):
        """测试图结构是否正确构建"""
        workflow = self.rag_graph.workflow

        # 验证所有节点都被添加
        self.assertIn("retrieve", workflow.nodes)
        self.assertIn("grade_documents", workflow.nodes)
        self.assertIn("generate", workflow.nodes)
        self.assertIn("transform_query", workflow.nodes)

        # 验证边的连接
        edges = workflow.edges

        # 验证起始边
        start_edges = [edge for edge in edges if edge[0] == START]
        self.assertTrue(any(edge[1] == "retrieve" for edge in start_edges))

        # 验证retrieve到grade_documents的边
        retrieve_edges = [edge for edge in edges if edge[0] == "retrieve"]
        self.assertTrue(
            any(edge[1] == "grade_documents" for edge in retrieve_edges))

        # 验证transform_query到retrieve的边
        transform_edges = [
            edge for edge in edges if edge[0] == "transform_query"
        ]
        self.assertTrue(any(edge[1] == "retrieve" for edge in transform_edges))

    def test_compile(self):
        """测试图的编译"""
        compiled_graph = self.rag_graph.compile()
        self.assertIsNotNone(compiled_graph)

    def test_graph_state_type(self):
        """测试GraphState类型定义"""
        # 验证GraphState包含所需的所有字段
        self.assertTrue(hasattr(GraphState, '__annotations__'))
        annotations = GraphState.__annotations__

        self.assertIn('question', annotations)
        self.assertIn('generation', annotations)
        self.assertIn('documents', annotations)

        # 验证字段类型
        self.assertEqual(annotations['question'], str)
        self.assertEqual(annotations['generation'], str)
        self.assertEqual(annotations['documents'], List[str])

    @patch('graph.decide_to_generate')
    @patch('graph.grade_generation_v_documents_and_question')
    def test_conditional_edges(self, mock_grade_generation,
                               mock_decide_generate):
        """测试条件边的配置"""
        workflow = self.rag_graph.workflow

        # 验证从grade_documents出发的条件边
        grade_docs_edges = [
            edge for edge in workflow.edges
            if edge[0] == "grade_documents" and len(edge) > 2
        ]
        self.assertTrue(len(grade_docs_edges) == 0)

        # 验证从generate出发的条件边
        generate_edges = [
            edge for edge in workflow.edges
            if edge[0] == "generate" and len(edge) > 2
        ]
        self.assertTrue(len(generate_edges) == 0)


if __name__ == '__main__':
    unittest.main()
