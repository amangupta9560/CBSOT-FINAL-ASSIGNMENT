import json
from graph.graph_state import ResearchGraphState
from services.groq_service import generate_with_groq as generate_with_gemini
from prompts.system_prompts import MASTER_SYSTEM, HIGHLIGHTS_SYSTEM
from vector_db.query_engine import get_full_context
from utils.helpers import clean_json_response
from utils.logger import get_logger

logger = get_logger("highlights_agent")

async def highlights_agent(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Executing Highlights Agent...")
    state["current_agent"] = "highlights"
    
    user_id = state.get("user_id")
    paper_id = state.get("paper_id")
    
    context = get_full_context(user_id, paper_id)
    
    prompt = f"""{MASTER_SYSTEM}
{HIGHLIGHTS_SYSTEM}

DOCUMENT TEXT:
{context}
"""
    
    highlights_data = {
        "highlights": []
    }
    
    try:
        response = await generate_with_gemini(prompt, temperature=0.3, max_tokens=1000)
        cleaned = clean_json_response(response)
        highlights_data = json.loads(cleaned)
    except Exception as e:
        logger.error(f"Error executing Highlights Agent: {str(e)}")
        
    state["highlights"] = highlights_data
    state["completed_agents"].append("highlights")
    return state
