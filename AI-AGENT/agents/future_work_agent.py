import json
from graph.graph_state import ResearchGraphState
from services.groq_service import generate_with_groq as generate_with_gemini
from prompts.system_prompts import MASTER_SYSTEM, FUTURE_WORK_SYSTEM
from vector_db.query_engine import query_collection
from utils.helpers import clean_json_response
from utils.logger import get_logger

logger = get_logger("future_work_agent")

async def future_work_agent(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Executing Future Work Agent...")
    state["current_agent"] = "future_work"
    
    user_id = state.get("user_id")
    paper_id = state.get("paper_id")
    
    chunks = query_collection(
        user_id=user_id,
        paper_id=paper_id,
        query_text="future work future directions next steps recommendations conclusion",
        n_results=6,
        section_filter=["conclusion", "future_work", "discussion"]
    )
    
    context = "\n\n".join([c["text"] for c in chunks]) if chunks else "No relevant future work chunks found."
    
    prompt = f"""{MASTER_SYSTEM}
{FUTURE_WORK_SYSTEM}

DOCUMENT TEXT:
{context}
"""
    
    future_work_data = {
        "suggestions": []
    }
    
    try:
        response = await generate_with_gemini(prompt, temperature=0.4, max_tokens=1000)
        cleaned = clean_json_response(response)
        future_work_data = json.loads(cleaned)
    except Exception as e:
        logger.error(f"Error executing Future Work Agent: {str(e)}")
        
    state["future_work"] = future_work_data
    state["completed_agents"].append("future_work")
    return state
