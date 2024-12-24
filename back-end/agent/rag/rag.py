from .tools import VectorStore
from .graph import RAGGraph
from pprint import pprint


def get_rag_answer(query, vector_store):
    graph = RAGGraph(vector_store)
    app = graph.compile()
    # Run
    inputs = {"question": query}
    for output in app.stream(inputs):
        for key, value in output.items():
            pprint(f"Node '{key}':")
        pprint("\n---\n")
    return value["generation"]


# Final generation
