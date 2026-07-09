from graph.graph_state import ResearchGraphState
from services.groq_service import generate_with_groq as generate_with_gemini
from prompts.system_prompts import MASTER_SYSTEM, LITERATURE_SYSTEM
from vector_db.query_engine import get_full_context
from utils.logger import get_logger

logger = get_logger("literature_review_agent")

async def literature_review_agent(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Executing Literature Review Agent...")
    state["current_agent"] = "literature_review"
    
    user_id = state.get("user_id")
    current_paper_id = state.get("paper_id")
    additional_ids = state.get("additional_paper_ids", [])
    
    all_paper_ids = [current_paper_id] + additional_ids
    
    combined_contexts = []
    
    for idx, pid in enumerate(all_paper_ids):
        # Fetch top 10 chunks/context for each paper
        logger.info(f"Retrieving context for Paper {idx+1} (ID: {pid})...")
        paper_context = get_full_context(user_id, pid)
        # Grab first 4000 characters from top 30 chunks as sample context to prevent prompt token limit overflow
        sample = paper_context[:4000] if paper_context else "No content available."
        combined_contexts.append(f"--- [Paper {idx+1} | ID: {pid}] ---\n{sample}")
        
    context_str = "\n\n\n".join(combined_contexts)
    
    prompt = f"""{MASTER_SYSTEM}
{LITERATURE_SYSTEM}

PAPERS DATA:
{context_str}
"""
    
    review_markdown = ""
    try:
        # Increase max tokens for comprehensive literature review writing
        response = await generate_with_gemini(prompt, temperature=0.5, max_tokens=3000)
        review_markdown = response
    except Exception as e:
        logger.error(f"Error executing Literature Review Agent: {str(e)}")
        review_markdown = "Failed to generate literature review due to processing error."
        
    state["literature_review"] = review_markdown
    state["completed_agents"].append("literature_review")
    return state
