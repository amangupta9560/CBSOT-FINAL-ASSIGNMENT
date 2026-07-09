import json
from graph.graph_state import ResearchGraphState
from services.groq_service import generate_with_groq as generate_with_gemini
from prompts.system_prompts import MASTER_SYSTEM, EXPERIMENT_SYSTEM
from vector_db.query_engine import query_collection
from utils.helpers import clean_json_response
from utils.logger import get_logger

logger = get_logger("experiment_agent")

async def experiment_agent(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Executing Experiment Agent...")
    state["current_agent"] = "experiment_suggestions"
    
    user_id = state.get("user_id")
    paper_id = state.get("paper_id")
    gaps = state.get("research_gaps", {})
    
    chunks = query_collection(
        user_id=user_id,
        paper_id=paper_id,
        query_text="methodology implementation details model parameters dataset metrics experiment setup evaluation",
        n_results=5,
        section_filter=["methodology", "experiments", "results"]
    )
    
    context = "\n\n".join([c["text"] for c in chunks]) if chunks else "No relevant methodology chunks found."
    
    prompt = f"""{MASTER_SYSTEM}
{EXPERIMENT_SYSTEM}

Analyze the methodology and identified research gaps below to suggest concrete, actionable follow-up experiments.

METHODOLOGY CONTEXT:
{context}

IDENTIFIED RESEARCH GAPS:
{json.dumps(gaps, indent=2)}
"""
    
    experiment_data = {
        "experiments": []
    }
    
    try:
        response = await generate_with_gemini(prompt, temperature=0.6, max_tokens=1200)
        cleaned = clean_json_response(response)
        experiment_data = json.loads(cleaned)
    except Exception as e:
        logger.error(f"Error executing Experiment Agent: {str(e)}")
        
    state["experiment_suggestions"] = experiment_data
    state["completed_agents"].append("experiment_suggestions")
    return state
