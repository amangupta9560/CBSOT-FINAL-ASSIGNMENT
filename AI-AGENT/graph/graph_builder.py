from langgraph.graph import StateGraph, END
from graph.graph_state import ResearchGraphState

# Import all agents
from agents.paper_understanding_agent import paper_understanding_agent
from agents.summary_agent import summary_agent
from agents.citation_agent import citation_agent
from agents.gap_agent import gap_agent
from agents.future_work_agent import future_work_agent
from agents.experiment_agent import experiment_agent
from agents.flashcard_agent import flashcard_agent
from agents.quiz_agent import quiz_agent
from agents.mindmap_agent import mindmap_agent
from agents.keyword_agent import keyword_agent
from agents.idea_generator_agent import idea_generator_agent
from agents.qa_agent import qa_agent
from agents.literature_review_agent import literature_review_agent
from agents.writing_assistant_agent import writing_assistant_agent
from agents.equations_agent import equations_agent
from agents.highlights_agent import highlights_agent
from agents.figure_agent import figure_agent

# Import services and helpers for ingestion
from services.pdf_service import download_pdf, extract_pdf_content
from rag.cleaner import clean_text, detect_sections
from rag.chunker import chunk_text
from vector_db.collection_manager import store_chunks
from utils.logger import get_logger

logger = get_logger("graph_builder")

# Ingestion Nodes
async def pdf_ingestion_node(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Node: pdf_ingestion")
    if state.get("error"):
        return state
    if state.get("task_type", "full_process") != "full_process":
        logger.info(f"Skipping pdf_ingestion for task: {state.get('task_type')}")
        return state
    try:
        url = state["cloudinary_url"]
        paper_id = state["paper_id"]
        pdf_bytes = await download_pdf(url, paper_id)
        pdf_data = extract_pdf_content(pdf_bytes)
        state["pdf_bytes"] = pdf_bytes
        state["raw_text"] = pdf_data['rawText']
    except Exception as e:
        logger.error(f"Error in pdf_ingestion node: {e}")
        state["error"] = f"Ingestion error: {str(e)}"
    return state

async def text_cleaning_node(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Node: text_cleaning")
    if state.get("error"):
        return state
    if state.get("task_type", "full_process") != "full_process":
        logger.info(f"Skipping text_cleaning for task: {state.get('task_type')}")
        return state
    try:
        raw_text = state.get("raw_text", "")
        if not raw_text:
            raise ValueError("No raw text available to clean.")
        cleaned = clean_text(raw_text)
        sections = detect_sections(cleaned)
        state["cleaned_text"] = cleaned
        state["section_map"] = sections
    except Exception as e:
        logger.error(f"Error in text_cleaning node: {e}")
        state["error"] = f"Cleaning error: {str(e)}"
    return state

async def chunking_embedding_node(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Node: chunking_embedding")
    if state.get("error"):
        return state
    if state.get("task_type", "full_process") != "full_process":
        logger.info(f"Skipping chunking_embedding for task: {state.get('task_type')}")
        return state
    try:
        cleaned_text = state.get("cleaned_text", "")
        user_id = state.get("user_id")
        paper_id = state.get("paper_id")
        sections = state.get("section_map", {})
        if not cleaned_text:
            raise ValueError("No cleaned text available to chunk.")
        
        chunks = chunk_text(
            text=cleaned_text,
            chunk_size=512,
            overlap=50,
            paper_id=paper_id,
            user_id=user_id,
            section_map=sections
        )
        store_chunks(user_id, paper_id, chunks)
        state["chunks"] = chunks
        state["embeddings_stored"] = True
    except Exception as e:
        logger.error(f"Error in chunking_embedding node: {e}")
        state["error"] = f"Chunking/embedding error: {str(e)}"
    return state


# Callback Node
async def send_results_to_backend(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Node: callback_node")
    from api.paper_routes import notify_backend_callback
    
    if state.get("error"):
        payload = {
            "paperId": state["paper_id"],
            "status": "failed",
            "error": state["error"]
        }
    else:
        payload = {
            "paperId": state["paper_id"],
            "status": "ready",
            "agentOutputs": {
                "paper_metadata": state.get("paper_metadata", {}),
                "summary": state.get("summary", {}),
                "citations": state.get("citations", {}),
                "research_gaps": state.get("research_gaps", {}),
                "future_work": state.get("future_work", {}),
                "experiment_suggestions": state.get("experiment_suggestions", {}),
                "keywords": state.get("keywords", {}),
                "mind_map": state.get("mind_map", {}),
                "equations": state.get("equations", {}),
                "highlights": state.get("highlights", {}),
                "flashcards": state.get("flashcards", []),
                "quiz": state.get("quiz", []),
                "research_ideas": state.get("research_ideas", []),
                "literature_review": state.get("literature_review", ""),
                "figures": state.get("figures", []),
                "writing_drafts": state.get("writing_drafts", {})
            }
        }
        
    await notify_backend_callback(payload)
    return state

# Routing logic
def route_after_ingestion(state: ResearchGraphState) -> str:
    if state.get("error"):
        return "callback"
        
    task = state.get("task_type", "full_process")
    if task == "literature_review":
        return "literature_review"
    elif task == "qa":
        return "qa"
    else:
        return "full_process"

def build_research_graph():
    workflow = StateGraph(ResearchGraphState)
    
    # 1. Add all nodes
    workflow.add_node("pdf_ingestion_node", pdf_ingestion_node)
    workflow.add_node("text_cleaning_node", text_cleaning_node)
    workflow.add_node("chunking_embedding_node", chunking_embedding_node)
    
    # Agents
    workflow.add_node("paper_understanding_node", paper_understanding_agent)
    workflow.add_node("summary_node", summary_agent)
    workflow.add_node("keyword_extraction_node", keyword_agent)
    workflow.add_node("citation_node", citation_agent)
    workflow.add_node("gap_analysis_node", gap_agent)
    workflow.add_node("future_work_node", future_work_agent)
    workflow.add_node("experiment_suggestions_node", experiment_agent)
    workflow.add_node("mind_map_node", mindmap_agent)
    workflow.add_node("flashcards_node", flashcard_agent)
    workflow.add_node("quiz_node", quiz_agent)
    workflow.add_node("idea_generator_node", idea_generator_agent)
    workflow.add_node("equations_node", equations_agent)
    workflow.add_node("highlights_node", highlights_agent)
    workflow.add_node("figure_extraction_node", figure_agent)
    workflow.add_node("literature_review_node", literature_review_agent)
    workflow.add_node("writing_assistant_node", writing_assistant_agent)
    workflow.add_node("qa_node", qa_agent)
    
    # Callback
    workflow.add_node("callback_node", send_results_to_backend)
    
    # 2. Add entry point & linear ingestion flow
    workflow.set_entry_point("pdf_ingestion_node")
    workflow.add_edge("pdf_ingestion_node", "text_cleaning_node")
    workflow.add_edge("text_cleaning_node", "chunking_embedding_node")
    
    # 3. Add conditional router after ingestion
    workflow.add_conditional_edges(
        "chunking_embedding_node",
        route_after_ingestion,
        {
            "full_process": "paper_understanding_node",
            "literature_review": "literature_review_node",
            "qa": "qa_node",
            "callback": "callback_node"
        }
    )
    
    # 4. Sequenced multi-agent flow for full process
    workflow.add_edge("paper_understanding_node", "summary_node")
    workflow.add_edge("summary_node", "keyword_extraction_node")
    workflow.add_edge("keyword_extraction_node", "citation_node")
    workflow.add_edge("citation_node", "gap_analysis_node")
    workflow.add_edge("gap_analysis_node", "future_work_node")
    workflow.add_edge("future_work_node", "experiment_suggestions_node")
    workflow.add_edge("experiment_suggestions_node", "mind_map_node")
    workflow.add_edge("mind_map_node", "flashcards_node")
    workflow.add_edge("flashcards_node", "quiz_node")
    workflow.add_edge("quiz_node", "idea_generator_node")
    workflow.add_edge("idea_generator_node", "equations_node")
    workflow.add_edge("equations_node", "highlights_node")
    workflow.add_edge("highlights_node", "figure_extraction_node")
    workflow.add_edge("figure_extraction_node", "callback_node")
    
    # 5. Sequenced literature review flow
    workflow.add_edge("literature_review_node", "writing_assistant_node")
    workflow.add_edge("writing_assistant_node", "callback_node")
    
    # 6. QA Flow (ends directly or goes to callback node)
    workflow.add_edge("qa_node", END)
    
    # 7. End node
    workflow.add_edge("callback_node", END)
    
    return workflow.compile()
