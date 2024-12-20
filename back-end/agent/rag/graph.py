from typing import List
from typing_extensions import TypedDict
from langgraph.graph import END, StateGraph, START
from nodes import RAGNodes
from edges import decide_to_generate, grade_generation_v_documents_and_question
from chains import build_retrieval_grader_chain, build_rag_chain, build_question_rewriter_chain
from tools import VectorStore


class GraphState(TypedDict):
    """
    Represents the state of our graph.
    
    Attributes:
        question: question
        generation: LLM generation
        documents: list of documents
    """
    question: str
    generation: str
    documents: List[str]


class RAGGraph:

    def __init__(self, vector_store: VectorStore):
        """Initialize the RAG graph with nodes"""
        self.rag_chain = build_rag_chain()
        self.vector_store = vector_store
        self.question_rewriter = build_question_rewriter_chain()
        self.retrieval_grader = build_retrieval_grader_chain()
        self.nodes = RAGNodes(self.vector_store.get_retriever(),
                              self.rag_chain, self.question_rewriter,
                              self.retrieval_grader)
        self.workflow = StateGraph(GraphState)
        self._build_graph()

    def _build_graph(self):
        """Build the graph with nodes and edges"""
        # Define the nodes
        self.workflow.add_node("retrieve", self.nodes.retrieve)
        self.workflow.add_node("grade_documents", self.nodes.grade_documents)
        self.workflow.add_node("generate", self.nodes.generate)
        self.workflow.add_node("transform_query", self.nodes.transform_query)

        # Build graph
        self.workflow.add_edge(START, "retrieve")
        self.workflow.add_edge("retrieve", "grade_documents")
        self.workflow.add_conditional_edges(
            "grade_documents",
            decide_to_generate,
            {
                "transform_query": "transform_query",
                "generate": "generate",
            },
        )
        self.workflow.add_edge("transform_query", "retrieve")
        self.workflow.add_conditional_edges(
            "generate",
            grade_generation_v_documents_and_question,
            {
                "not supported": "generate",
                "useful": END,
                "not useful": "transform_query",
            },
        )

    def compile(self):
        """Compile the workflow"""
        return self.workflow.compile()
