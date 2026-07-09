import json
from graph.graph_state import ResearchGraphState
from services.groq_service import generate_with_groq as generate_with_gemini
from prompts.system_prompts import MASTER_SYSTEM, EQUATIONS_SYSTEM
from vector_db.query_engine import query_collection
from utils.helpers import clean_json_response
from utils.logger import get_logger

logger = get_logger("equations_agent")

async def equations_agent(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Executing Equations Agent...")
    state["current_agent"] = "equations"
    
    user_id = state.get("user_id")
    paper_id = state.get("paper_id")
    
    chunks = query_collection(
        user_id=user_id,
        paper_id=paper_id,
        query_text="equations formulas calculations algorithms proofs mathematical models variables parameters",
        n_results=5
    )
    
    context = "\n\n".join([c["text"] for c in chunks]) if chunks else "No relevant equation chunks found."
    
    prompt = f"""{MASTER_SYSTEM}
{EQUATIONS_SYSTEM}

DOCUMENT TEXT:
{context}
"""
    
    equations_data = {
        "equations": []
    }
    
    try:
        response = await generate_with_gemini(prompt, temperature=0.2, max_tokens=1000)
        cleaned = clean_json_response(response)
        equations_data = json.loads(cleaned)
    except Exception as e:
        logger.error(f"Error executing Equations Agent: {str(e)}")
        
    state["equations"] = equations_data
    state["completed_agents"].append("equations")
    return state
