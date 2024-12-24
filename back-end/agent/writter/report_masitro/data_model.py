import operator
from typing_extensions import TypedDict
from typing import Annotated, List, Optional, Literal
from pydantic import BaseModel, Field


class Section(BaseModel):
    name: str = Field(description="Name for this section of the report.", )
    description: str = Field(
        description=
        "Brief overview of the main topics and concepts to be covered in this section.",
    )
    research: bool = Field(
        description=
        "Whether to perform web research for this section of the report.")
    content: str = Field(description="The content of the section.")


class Sections(BaseModel):
    sections: List[Section] = Field(description="Sections of the report.", )


class SearchQuery(BaseModel):
    search_query: str = Field(None, description="Query for web search.")


class Queries(BaseModel):
    queries: List[SearchQuery] = Field(description="List of search queries.", )


class ReportStateInput(TypedDict):
    topic: str  # Report topic


class ReportStateOutput(TypedDict):
    final_report: str  # Final report


class ReportState(TypedDict):
    topic: str  # Report topic
    report_structure: str  # Report structure
    number_of_queries: int  # Number web search queries to perform per section
    sections: list[Section]  # List of report sections
    completed_sections: Annotated[list, operator.add]  # Send() API key
    report_sections_from_research: str  # String of any completed sections from research to write final sections
    final_report: str  # Final report


class SectionState(TypedDict):
    number_of_queries: int  # Number web search queries to perform per section
    section: Section  # Report section
    search_queries: list[SearchQuery]  # List of search queries
    source_str: str  # String of formatted source content from web search
    report_sections_from_research: str  # String of any completed sections from research to write final sections
    completed_sections: list[
        Section]  # Final key we duplicate in outer state for Send() API


class SectionOutputState(TypedDict):
    completed_sections: list[
        Section]  # Final key we duplicate in outer state for Send() API
