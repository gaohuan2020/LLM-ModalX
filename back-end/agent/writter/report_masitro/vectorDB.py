from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from .model import embeddings
from typing import List
from langchain.schema import Document


class VectorStore():

    def __init__(self, path: str = None):
        self.index = None
        if path is not None:
            self.index = Chroma(embedding_function=embeddings,
                                persist_directory=path)

    def create_index(self, documents: List[Document]) -> Chroma:
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000,
                                                       chunk_overlap=200)
        doc_splits = text_splitter.split_documents(documents)

        vectorstore = Chroma.from_documents(doc_splits,
                                            embeddings,
                                            persist_directory="./chroma_db")
        self.index = vectorstore

    def create_document(self, content: str, source: str) -> Document:
        """Create a list of documents from an text content."""
        return Document(page_content=content, metadata={"source": source})

    def search(self, query: str) -> List[Document]:
        return self.index.similarity_search(query, k=2)

    def search_list(self, query_list: List[str]) -> List[Document]:
        docs = []
        for query in query_list:
            docs.append(self.index.similarity_search_with_score(query, k=5))
        return docs

    def get_retriever(self):
        return self.index.as_retriever()
