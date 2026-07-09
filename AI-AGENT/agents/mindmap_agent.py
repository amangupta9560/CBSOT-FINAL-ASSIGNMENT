import json
from graph.graph_state import ResearchGraphState
from services.groq_service import generate_with_groq as generate_with_gemini
from prompts.system_prompts import MASTER_SYSTEM, MINDMAP_SYSTEM
from utils.helpers import clean_json_response
from utils.logger import get_logger

logger = get_logger("mindmap_agent")

async def mindmap_agent(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Executing Mindmap Agent...")
    state["current_agent"] = "mind_map"
    
    summary = state.get("summary", {})
    keywords = state.get("keywords", {})
    metadata = state.get("paper_metadata", {})
    title = metadata.get("title") or summary.get("title") or "Research Paper"
    
    prompt = f"""{MASTER_SYSTEM}
{MINDMAP_SYSTEM}

Analyze the paper summary and keyword list to create a hierarchical mind map structure.

PAPER TITLE:
{title}

SUMMARY:
{json.dumps(summary, indent=2)}

KEYWORDS:
{json.dumps(keywords, indent=2)}
"""
    
    mindmap_data = {
        "root": {
            "id": "root",
            "label": title,
            "children": []
        }
    }
    
    try:
        response = await generate_with_gemini(prompt, temperature=0.3, max_tokens=1200)
        cleaned = clean_json_response(response)
        mindmap_data = json.loads(cleaned)
    except Exception as e:
        logger.error(f"Error executing Mindmap Agent: {str(e)}")
        # simple fallback mindmap
        mindmap_data["root"]["children"] = [
            {"id": "node_1", "label": "Introduction", "children": []},
            {"id": "node_2", "label": "Methodology", "children": []},
            {"id": "node_3", "label": "Results", "children": []},
            {"id": "node_4", "label": "Conclusion", "children": []}
        ]
        
    state["mind_map"] = mindmap_data
    state["completed_agents"].append("mind_map")
    return state
