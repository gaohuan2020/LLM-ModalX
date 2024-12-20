from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from model import embeddings
from typing import List
from langchain.schema import Document


class VectorStore():

    def __init__(self):
        self.index = None

    def create_index(self, documents: List[Document]) -> Chroma:
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000,
                                                       chunk_overlap=200)
        doc_splits = text_splitter.split_documents(documents)

        vectorstore = Chroma.from_documents(doc_splits, embeddings)
        self.index = vectorstore

    def create_document(self, content: str, source: str) -> Document:
        """Create a list of documents from an text content."""
        return Document(page_content=content, metadata={"source": source})

    def search(self, query: str) -> str:
        return self.index.similarity_search(query)

    def get_retriever(self):
        return self.index.as_retriever()
