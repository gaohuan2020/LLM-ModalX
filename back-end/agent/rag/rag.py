from tools import VectorStore
from graph import RAGGraph
from pprint import pprint

vector_store = VectorStore()
doc1 = vector_store.create_document("把手机放到桌子上了", "audio")
doc2 = vector_store.create_document("今天天气不错", "text")
vector_store.create_index([doc1, doc2])
vector_store.search("我手机放到哪了")
graph = RAGGraph(vector_store)
app = graph.compile()
# Run
inputs = {"question": "我的手机放到哪了"}
for output in app.stream(inputs):
    for key, value in output.items():
        # Node
        pprint(f"Node '{key}':")
    pprint("\n---\n")

# Final generation
pprint(value["generation"])
