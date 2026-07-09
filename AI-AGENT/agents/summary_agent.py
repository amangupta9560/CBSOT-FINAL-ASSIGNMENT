import json
from graph.graph_state import ResearchGraphState
from services.groq_service import generate_with_groq as generate_with_gemini
from prompts.system_prompts import MASTER_SYSTEM, SUMMARY_SYSTEM
from vector_db.query_engine import get_full_context
from utils.helpers import clean_json_response
from utils.logger import get_logger

logger = get_logger("summary_agent")

async def summary_agent(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Executing Summary Agent...")
    state["current_agent"] = "summary"
    
    user_id = state.get("user_id")
    paper_id = state.get("paper_id")
    
    # Retrieve top 30 chunks as context for comprehensive summary
    context = get_full_context(user_id, paper_id)
    
    prompt = f"""{MASTER_SYSTEM}
{SUMMARY_SYSTEM}

Analyze the following document text and output the summary JSON.

DOCUMENT TEXT:
{context}
"""
    
    summary_data = {
        "simple": "",
        "technical": "",
        "keyContributions": [],
        "methodology": "",
        "results": "",
        "limitations": ""
    }
    
    try:
        response = await generate_with_gemini(prompt, temperature=0.2, max_tokens=1500)
        cleaned = clean_json_response(response)
        summary_data = json.loads(cleaned)
    except Exception as e:
        logger.error(f"Error executing Summary Agent: {str(e)}")
        # Basic fallback summary
        summary_data["simple"] = "Could not generate summary due to processing error."
        summary_data["technical"] = "Detailed summary generation failed."
        
    state["summary"] = summary_data
    state["completed_agents"].append("summary")
    return state
