import json
from graph.graph_state import ResearchGraphState
from services.groq_service import generate_with_groq as generate_with_gemini
from prompts.system_prompts import CITATION_SYSTEM
from utils.helpers import clean_json_response
from utils.logger import get_logger

logger = get_logger("citation_agent")

async def citation_agent(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Executing Citation Agent...")
    state["current_agent"] = "citation"
    
    metadata = state.get("paper_metadata", {})
    
    prompt = f"""{CITATION_SYSTEM}

Metadata to format:
{json.dumps(metadata, indent=2)}
"""
    
    citations = {
        "apa": "",
        "bibtex": "",
        "ieee": "",
        "mla": ""
    }
    
    try:
        response = await generate_with_gemini(prompt, temperature=0.1, max_tokens=800)
        cleaned = clean_json_response(response)
        citations = json.loads(cleaned)
    except Exception as e:
        logger.error(f"Error executing Citation Agent: {str(e)}")
        # Simple manual format fallback
        title = metadata.get("title", "Unknown Title")
        authors_list = metadata.get("authors", [])
        authors = ", ".join(authors_list) if authors_list else "Unknown Authors"
        year = metadata.get("year", "n.d.")
        journal = metadata.get("journal", "Unknown Journal")
        doi = metadata.get("doi", "")
        
        citations["apa"] = f"{authors} ({year}). {title}. {journal}. {f'doi:{doi}' if doi else ''}".strip()
        citations["ieee"] = f"[1] {authors}, \"{title},\" {journal}, {year}."
        citations["mla"] = f"{authors}. \"{title}.\" {journal} {year}."
        citations["bibtex"] = f"@article{{paper_{year},\n  author={{{authors}}},\n  title={{{title}}},\n  journal={{{journal}}},\n  year={{{year}}}\n}}"
        
    state["citations"] = citations
    state["completed_agents"].append("citation")
    return state
