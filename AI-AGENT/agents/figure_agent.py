import re
import json
from graph.graph_state import ResearchGraphState
from services.groq_service import generate_with_groq as generate_with_groq
from prompts.system_prompts import MASTER_SYSTEM, FIGURE_SYSTEM
from vector_db.query_engine import get_full_context
from utils.logger import get_logger

logger = get_logger("figure_agent")

def extract_figure_captions(text: str) -> list:
    """
    Scans cleaned text for lines that look like figure or table captions,
    e.g. 'Figure 1:', 'Fig. 2.', 'Table 3:' etc.
    Returns a list of (id, caption) tuples.
    """
    pattern = re.compile(
        r'(?:(?:Figure|Fig\.?|Table|Chart|Scheme)\s+\d+[a-zA-Z]?[.:\-–]\s*.{10,200})',
        re.IGNORECASE
    )
    matches = pattern.findall(text)
    captions = []
    seen = set()
    for idx, match in enumerate(matches):
        cleaned = match.strip()
        if cleaned not in seen:
            seen.add(cleaned)
            captions.append({
                "id": f"fig_{idx + 1}",
                "raw_caption": cleaned
            })
    return captions[:15]  # Limit to 15 figures to stay within token limits


async def figure_agent(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Executing Figure & Table Analysis Agent...")
    state["current_agent"] = "figures"

    paper_id = state.get("paper_id")
    user_id = state.get("user_id")

    # Get text — prefer cleaned_text from state, else fetch from vector DB
    text = state.get("cleaned_text", "")
    if not text:
        text = get_full_context(user_id, paper_id)

    if not text:
        logger.warning("No text available for figure extraction.")
        state["figures"] = []
        state["completed_agents"].append("figures")
        return state

    captions = extract_figure_captions(text)

    if not captions:
        logger.info("No figure/table captions found in text.")
        state["figures"] = []
        state["completed_agents"].append("figures")
        return state

    captions_str = "\n".join([f"{c['id']}: {c['raw_caption']}" for c in captions])

    # Use surrounding context from full text for richer analysis
    context_sample = text[:6000]

    prompt = f"""{MASTER_SYSTEM}
{FIGURE_SYSTEM}

PAPER CONTEXT (first 6000 chars):
{context_sample}

FIGURE/TABLE CAPTIONS TO ANALYZE:
{captions_str}
"""

    figures = []
    try:
        response = await generate_with_groq(prompt, temperature=0.3, max_tokens=3000)
        # Strip markdown fences if present
        clean = response.strip()
        if clean.startswith("```"):
            clean = re.sub(r"^```[a-zA-Z]*\n?", "", clean)
            clean = re.sub(r"\n?```$", "", clean)
        figures = json.loads(clean)
        if not isinstance(figures, list):
            figures = []
    except Exception as e:
        logger.error(f"Error in Figure Agent: {e}")
        # Fallback: return raw captions without LLM analysis
        figures = [
            {
                "id": c["id"],
                "title": c["raw_caption"],
                "description": "Analysis unavailable.",
                "analysis": "Analysis unavailable."
            }
            for c in captions
        ]

    state["figures"] = figures
    state["completed_agents"].append("figures")
    logger.info(f"Figure agent extracted {len(figures)} figures/tables.")
    return state
