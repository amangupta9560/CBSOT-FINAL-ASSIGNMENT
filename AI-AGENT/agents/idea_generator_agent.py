import json
from graph.graph_state import ResearchGraphState
from services.groq_service import generate_with_groq as generate_with_gemini
from prompts.system_prompts import MASTER_SYSTEM, IDEA_SYSTEM
from utils.helpers import clean_json_response
from utils.logger import get_logger

logger = get_logger("idea_generator_agent")

async def idea_generator_agent(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Executing Idea Generator Agent...")
    state["current_agent"] = "idea_generator"
    
    summary = state.get("summary", {})
    gaps = state.get("research_gaps", {})
    
    prompt = f"""{MASTER_SYSTEM}
{IDEA_SYSTEM}

Based on the paper summary and the identified research gaps, brainstorm exactly 5 novel, creative, and feasible research project ideas.

SUMMARY:
{json.dumps(summary, indent=2)}

RESEARCH GAPS:
{json.dumps(gaps, indent=2)}
"""
    
    ideas = []
    
    try:
        response = await generate_with_gemini(prompt, temperature=0.8, max_tokens=1500)
        cleaned = clean_json_response(response)
        ideas = json.loads(cleaned)
    except Exception as e:
        logger.error(f"Error executing Idea Generator Agent: {str(e)}")
        
    state["research_ideas"] = ideas
    state["completed_agents"].append("idea_generator")
    return state
