from typing import Dict, Any


class RAGNodes:

    def __init__(self, retriever, rag_chain, question_rewriter,
                 retrieval_grader):
        """Initialize RAG nodes with required components"""
        self.retriever = retriever
        self.rag_chain = rag_chain
        self.question_rewriter = question_rewriter
        self.retrieval_grader = retrieval_grader

    def retrieve(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Retrieve documents"""
        print("---RETRIEVE---")
        question = state["question"]
        documents = self.retriever.invoke(question)
        return {"documents": documents, "question": question}

    def generate(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Generate answer"""
        print("---GENERATE---")
        question = state["question"]
        documents = state["documents"]
        generation = self.rag_chain.invoke({
            "context": documents,
            "question": question
        })
        return {
            "documents": documents,
            "question": question,
            "generation": generation
        }

    def transform_query(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Transform the query to produce a better question"""
        print("---TRANSFORM QUERY---")
        question = state["question"]
        documents = state["documents"]
        better_question = self.question_rewriter.invoke({"question": question})
        return {"documents": documents, "question": better_question}

    def grade_documents(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Determines whether the retrieved documents are relevant"""
        print("---CHECK DOCUMENT RELEVANCE TO QUESTION---")
        question = state["question"]
        documents = state["documents"]

        filtered_docs = []
        for d in documents:
            score = self.retrieval_grader.invoke({
                "question": question,
                "document": d.page_content
            })
            if score.binary_score == "yes":
                print("---GRADE: DOCUMENT RELEVANT---")
                filtered_docs.append(d)
            else:
                print("---GRADE: DOCUMENT NOT RELEVANT---")
        return {"documents": filtered_docs, "question": question}
