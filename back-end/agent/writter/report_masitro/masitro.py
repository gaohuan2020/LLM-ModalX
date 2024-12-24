from .graph import ReportMasitroGraph
from .text_processor import TextProcessor


def get_report_masitro(title: str, vectorstore, config: str = None) -> str:
    """
    Generate a report based on title and configuration.
    
    Args:
        title: The report title
        vectorstore: The vector store for retrieving relevant information
        config: Optional configuration string specifying report structure
    
    Returns:
        str: The generated report content
    """
    try:
        graph = ReportMasitroGraph(vectorstore)
        report_graph = graph.compile()
        
        report = report_graph.invoke({
            "topic": title,
            "report_structure": config,
            "number_of_queries": 2
        })

        # 使用文本处理器处理输出
        processor = TextProcessor()
        final_report = processor.process_text(report['final_report'])
        
        return final_report

    except Exception as e:
        raise Exception(f"Error generating report: {str(e)}")


# vdb = VectorStore(path="./chroma_db")
# get_rag_answer("论中美人工智能的竞争", vdb)
