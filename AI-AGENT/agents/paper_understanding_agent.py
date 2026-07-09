import json
import re
from graph.graph_state import ResearchGraphState
from services.groq_service import generate_with_groq as generate_with_gemini
from prompts.system_prompts import MASTER_SYSTEM
from utils.helpers import extract_doi, extract_year, clean_json_response
from utils.logger import get_logger

logger = get_logger("paper_understanding_agent")

async def paper_understanding_agent(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Executing Paper Understanding Agent...")
    state["current_agent"] = "paper_understanding"
    
    raw_text = state.get("raw_text", "")
    sample_text = raw_text[:2000] if raw_text else ""
    
    # 1. Regex extracts
    regex_doi = extract_doi(raw_text)
    regex_year = extract_year(raw_text)
    
    # 2. LLM extracts
    prompt = f"""{MASTER_SYSTEM}

Analyze this academic text (first 2000 characters) and extract metadata.
Extract:
- title: string
- authors: list of strings (authors names)
- abstract: string (grounded summary or abstract text)
- doi: string
- year: integer (publication year)
- journal: string (journal or venue name)

Respond ONLY with a valid JSON object matching this schema:
{{
  "title": "Title string",
  "authors": ["Author 1", "Author 2"],
  "abstract": "Abstract text...",
  "doi": "DOI string or empty",
  "year": 2026,
  "journal": "Journal name or empty"
}}

TEXT:
{sample_text}
"""
    
    metadata = {
        "title": "",
        "authors": [],
        "abstract": "",
        "doi": regex_doi or "",
        "year": regex_year,
        "journal": ""
    }
    
    try:
        response = await generate_with_gemini(prompt, temperature=0.1, max_tokens=1000)
        cleaned = clean_json_response(response)
        llm_data = json.loads(cleaned)
        
        # Merge LLM results with priority to regex for doi and year
        metadata["title"] = llm_data.get("title", "")
        metadata["authors"] = llm_data.get("authors", [])
        metadata["abstract"] = llm_data.get("abstract", "")
        metadata["doi"] = regex_doi or llm_data.get("doi", "") or ""
        metadata["year"] = regex_year or llm_data.get("year")
        metadata["journal"] = llm_data.get("journal", "")
    except Exception as e:
        logger.error(f"Error parsing Gemini metadata: {str(e)}")
        # Fallback to regex & basic title if raw text is present
        if raw_text:
            first_line = raw_text.splitlines()[0] if raw_text.strip() else ""
            metadata["title"] = first_line[:150].strip()
            
    state["paper_metadata"] = metadata
    
    if "completed_agents" not in state or state["completed_agents"] is None:
        state["completed_agents"] = []
    state["completed_agents"].append("paper_understanding")
    
    logger.info(f"Metadata extracted: {metadata}")
    return state
