from .data_model import SectionState, SectionOutputState
from .node import ReportNodes
from .vectorDB import VectorStore
from .data_model import ReportState, ReportStateInput, ReportStateOutput
from langgraph.graph import START, END, StateGraph


class ReportMasitroGraph:

    def __init__(self, vectorDB: VectorStore):
        self.vectorDB = vectorDB
        self.report_nodes = ReportNodes(vectorDB)
        self.builder = StateGraph(ReportState,
                                  input=ReportStateInput,
                                  output=ReportStateOutput)
        self._build_graph()

    def _build_graph(self):
        section_builder = StateGraph(SectionState, output=SectionOutputState)
        section_builder.add_node("generate_queries",
                                 self.report_nodes.generate_queries)
        section_builder.add_node("search_web", self.report_nodes.search_web)
        section_builder.add_node("write_section",
                                 self.report_nodes.write_section)

        section_builder.add_edge(START, "generate_queries")
        section_builder.add_edge("generate_queries", "search_web")
        section_builder.add_edge("search_web", "write_section")
        section_builder.add_edge("write_section", END)

        self.builder = StateGraph(ReportState, output=ReportStateOutput)
        self.builder.add_node("generate_report_plan",
                              self.report_nodes.generate_report_plan)
        self.builder.add_node("build_section_with_web_research",
                              section_builder.compile())
        self.builder.add_node("gather_completed_sections",
                              self.report_nodes.gather_completed_sections)
        self.builder.add_node("write_final_sections",
                              self.report_nodes.write_final_sections)
        self.builder.add_node("compile_final_report",
                              self.report_nodes.compile_final_report)
        self.builder.add_edge(START, "generate_report_plan")
        self.builder.add_conditional_edges(
            "generate_report_plan", self.report_nodes.initiate_section_writing,
            ["build_section_with_web_research"])
        self.builder.add_edge("build_section_with_web_research",
                              "gather_completed_sections")
        self.builder.add_conditional_edges(
            "gather_completed_sections",
            self.report_nodes.initiate_final_section_writing,
            ["write_final_sections"])
        self.builder.add_edge("write_final_sections", "compile_final_report")
        self.builder.add_edge("compile_final_report", END)

    def compile(self):
        """Compile the workflow"""
        return self.builder.compile()
