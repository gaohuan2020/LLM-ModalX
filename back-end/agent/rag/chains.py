from .data_model import GradeDocuments, GradeHallucinations, GradeAnswer
from .model import llm
from langchain_core.prompts import ChatPromptTemplate
from langchain import hub
from langchain_core.output_parsers import StrOutputParser
import yaml
from pathlib import Path
import sys

# Load prompts from config
config_path = Path(__file__).parent / "config.yaml"
try:
    with open(config_path, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)
except FileNotFoundError:
    print(f"Error: Config file not found at {config_path}")
    sys.exit(1)
except yaml.YAMLError as e:
    print(f"Error parsing config file: {e}")
    sys.exit(1)

# LLM with function call


def build_retrieval_grader_chain():
    structured_llm_grader = llm.with_structured_output(GradeDocuments)
    grade_prompt = ChatPromptTemplate.from_messages([
        ("system", config['prompts']['retrieval_grader']),
        ("human", "Retrieved document: \n\n {document} \n\n User question: {question}"),
    ])
    return grade_prompt | structured_llm_grader


def build_rag_chain():
    prompt = hub.pull("rlm/rag-prompt")
    rag_chain = prompt | llm | StrOutputParser()
    return rag_chain


def build_hallucination_grader_chain():
    structured_llm_grader = llm.with_structured_output(GradeHallucinations)
    hallucination_prompt = ChatPromptTemplate.from_messages([
        ("system", config['prompts']['hallucination_grader']),
        ("human", "Set of facts: \n\n {documents} \n\n LLM generation: {generation}"),
    ])
    return hallucination_prompt | structured_llm_grader


def build_answer_grader_chain():
    structured_llm_grader = llm.with_structured_output(GradeAnswer)
    answer_prompt = ChatPromptTemplate.from_messages([
        ("system", config['prompts']['answer_grader']),
        ("human", "User question: \n\n {question} \n\n LLM generation: {generation}"),
    ])
    return answer_prompt | structured_llm_grader


def build_question_rewriter_chain():
    re_write_prompt = ChatPromptTemplate.from_messages([
        ("system", config['prompts']['question_rewriter']),
        ("human", "Here is the initial question: \n\n {question} \n Formulate an improved question."),
    ])
    return re_write_prompt | llm | StrOutputParser()
