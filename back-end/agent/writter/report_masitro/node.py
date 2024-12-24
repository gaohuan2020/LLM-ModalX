from .data_model import ReportState, Queries, Sections, SectionState
from langchain_core.runnables import RunnableConfig
from .model import llm
from .utilities import deduplicate_and_format_sources, format_sections
from .prompt import (report_planner_instructions,
                     report_planner_query_writer_instructions,
                     query_writer_instructions, section_writer_instructions,
                     final_section_writer_instructions)
from langchain_core.messages import HumanMessage, SystemMessage
from .vectorDB import VectorStore
from langgraph.constants import Send


class ReportNodes:

    def __init__(self, vectorDB: VectorStore):
        self.vectorDB = vectorDB

    def generate_report_plan(self, state: ReportState):
        """ Generate the report plan """
        # 原generate_report_plan函数的内容...
        topic = state["topic"]
        report_structure = state["report_structure"]
        number_of_queries = state["number_of_queries"]
        structured_llm = llm.with_structured_output(Queries)

        system_instructions_query = report_planner_query_writer_instructions.format(
            topic=topic,
            report_organization=report_structure,
            number_of_queries=number_of_queries)

        results = structured_llm.invoke([
            SystemMessage(content=system_instructions_query)
        ] + [
            HumanMessage(
                content=
                "Generate search queries that will help with planning the sections of the report in Chinese."
            )
        ])

        query_list = [query.search_query for query in results.queries]
        print(query_list)
        search_docs = self.vectorDB.search_list(query_list)

        source_str = deduplicate_and_format_sources(search_docs,
                                                    max_tokens_per_source=2000,
                                                    include_raw_content=False)

        system_instructions_sections = report_planner_instructions.format(
            topic=topic,
            report_organization=report_structure,
            context=source_str)
        print(system_instructions_sections)
        structured_llm = llm.with_structured_output(Sections)
        report_sections = structured_llm.invoke([
            SystemMessage(content=system_instructions_sections)
        ] + [
            HumanMessage(
                content=
                "Generate the sections of the report. Your response must include a 'sections' field containing a list of sections. Each section must have: name, description, plan, research, and content fields."
            )
        ])

        return {"sections": report_sections.sections}

    def generate_queries(self, state: SectionState, config: RunnableConfig):
        """ Generate search queries for a report section """
        # 原generate_queries函数的内容...
        section = state["section"]
        number_of_queries = 2

        structured_llm = llm.with_structured_output(Queries)
        system_instructions = query_writer_instructions.format(
            section_topic=section.description,
            number_of_queries=number_of_queries)

        queries = structured_llm.invoke(
            [SystemMessage(content=system_instructions)] + [
                HumanMessage(
                    content="Generate search queries on the provided topic.")
            ])

        return {"search_queries": queries.queries}

    def search_web(self, state: SectionState, config: RunnableConfig):
        """ Search the web for each query, then return a list of raw sources and a formatted string of sources."""
        # 原search_web函数的内容...
        search_queries = state["search_queries"]

        query_list = [query.search_query for query in search_queries]
        search_docs = self.vectorDB.search_list(query_list)

        source_str = deduplicate_and_format_sources(search_docs,
                                                    max_tokens_per_source=5000,
                                                    include_raw_content=True)

        return {"source_str": source_str}

    def write_section(self, state: SectionState):
        """ Write a section of the report """
        # 原write_section函数的内容...
        section = state["section"]
        source_str = state["source_str"]

        system_instructions = section_writer_instructions.format(
            section_title=section.name,
            section_topic=section.description,
            context=source_str)

        section_content = llm.invoke([
            SystemMessage(content=system_instructions)
        ] + [
            HumanMessage(
                content=
                "Generate a report section based on the provided sources in Chinese."
            )
        ])

        section.content = section_content.content
        return {"completed_sections": [section]}

    def write_final_sections(self, state: SectionState):
        """ Write final sections of the report, which do not require web search and use the completed sections as context """
        # 原write_final_sections函数的内容...
        section = state["section"]
        completed_report_sections = state["report_sections_from_research"]

        system_instructions = final_section_writer_instructions.format(
            section_title=section.name,
            section_topic=section.description,
            context=completed_report_sections)

        section_content = llm.invoke([
            SystemMessage(content=system_instructions)
        ] + [
            HumanMessage(
                content=
                "根据提供的资料生成报告章节。禁止使用过渡词，如'然而'、'但是'、'因此'、'所以'、'此外'、'总之'、'不仅'、'例如'，'特别是'等中英文过渡词。不要夸大其词。忠实原文内容，使内容简洁、清晰、流畅。不要将总结放到每个章节末尾"
            )
        ])

        section.content = section_content.content
        return {"completed_sections": [section]}

    def initiate_section_writing(self, state: ReportState):
        """ This is the "map" step when we kick off web research for some sections of the report """
        return [
            Send("build_section_with_web_research", {"section": s})
            for s in state["sections"] if s.research
        ]

    def gather_completed_sections(self, state: ReportState):
        """ Gather completed sections from research and format them as context for writing the final sections """
        completed_sections = state["completed_sections"]
        completed_report_sections = format_sections(completed_sections)
        return {"report_sections_from_research": completed_report_sections}

    def initiate_final_section_writing(self, state: ReportState):
        """ Write any final sections using the Send API to parallelize the process """
        return [
            Send(
                "write_final_sections", {
                    "section":
                    s,
                    "report_sections_from_research":
                    state["report_sections_from_research"]
                }) for s in state["sections"] if not s.research
        ]

    def compile_final_report(self, state: ReportState):
        """ Compile the final report """
        sections = state["sections"]
        completed_sections = {
            s.name: s.content
            for s in state["completed_sections"]
        }

        for section in sections:
            section.content = completed_sections[section.name]

        all_sections = "\n\n".join([s.content for s in sections])
        return {"final_report": all_sections}
