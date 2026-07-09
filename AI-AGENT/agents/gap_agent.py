import json
from graph.graph_state import ResearchGraphState
from services.groq_service import generate_with_groq as generate_with_gemini
from prompts.system_prompts import MASTER_SYSTEM, GAP_SYSTEM
from vector_db.query_engine import query_collection
from utils.helpers import clean_json_response
from utils.logger import get_logger

logger = get_logger("gap_agent")

async def gap_agent(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Executing Gap Agent...")
    state["current_agent"] = "gap_analysis"
    
    user_id = state.get("user_id")
    paper_id = state.get("paper_id")
    
    # Retrieve relevant limitation/discussion chunks
    chunks = query_collection(
        user_id=user_id,
        paper_id=paper_id,
        query_text="limitations future work discussion unexplored gaps missed opportunities",
        n_results=6,
        section_filter=["discussion", "conclusion", "limitations", "future_work"]
    )
    
    context = "\n\n".join([c["text"] for c in chunks]) if chunks else "No relevant discussion chunks found."
    
    prompt = f"""{MASTER_SYSTEM}
{GAP_SYSTEM}

DOCUMENT TEXT:
{context}
"""
    
    gap_data = {
        "gaps": [],
        "opportunities": [],
        "unexploredAreas": []
    }
    
    try:
        response = await generate_with_gemini(prompt, temperature=0.3, max_tokens=1000)
        cleaned = clean_json_response(response)
        gap_data = json.loads(cleaned)
    except Exception as e:
        logger.error(f"Error executing Gap Agent: {str(e)}")
        
    state["research_gaps"] = gap_data
    state["completed_agents"].append("gap_analysis")
    return state
