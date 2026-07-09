import json
from graph.graph_state import ResearchGraphState
from services.groq_service import generate_with_groq as generate_with_gemini
from prompts.system_prompts import MASTER_SYSTEM, KEYWORD_SYSTEM
from vector_db.query_engine import get_full_context
from utils.helpers import clean_json_response
from utils.logger import get_logger

logger = get_logger("keyword_agent")

async def keyword_agent(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Executing Keyword Agent...")
    state["current_agent"] = "keyword_extraction"
    
    user_id = state.get("user_id")
    paper_id = state.get("paper_id")
    
    context = get_full_context(user_id, paper_id)
    
    prompt = f"""{MASTER_SYSTEM}
{KEYWORD_SYSTEM}

DOCUMENT TEXT:
{context}
"""
    
    keyword_data = {
        "technical": [],
        "general": []
    }
    
    try:
        response = await generate_with_gemini(prompt, temperature=0.3, max_tokens=600)
        cleaned = clean_json_response(response)
        keyword_data = json.loads(cleaned)
    except Exception as e:
        logger.error(f"Error executing Keyword Agent: {str(e)}")
        
    state["keywords"] = keyword_data
    state["completed_agents"].append("keyword_extraction")
    return state
