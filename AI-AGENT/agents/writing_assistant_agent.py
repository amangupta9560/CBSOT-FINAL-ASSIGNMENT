import re
from graph.graph_state import ResearchGraphState
from services.groq_service import generate_with_groq as generate_with_groq
from prompts.system_prompts import MASTER_SYSTEM, PATENT_SYSTEM, GRANT_SYSTEM, SLIDES_SYSTEM
from vector_db.query_engine import get_full_context
from utils.logger import get_logger

logger = get_logger("writing_assistant_agent")

MODE_PROMPTS = {
    "patent": PATENT_SYSTEM,
    "grant": GRANT_SYSTEM,
    "slides": SLIDES_SYSTEM,
}

async def writing_assistant_agent(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Executing Writing Assistant Agent...")
    state["current_agent"] = "writing_assistant"

    paper_id = state.get("paper_id")
    user_id = state.get("user_id")
    writing_mode = state.get("writing_mode", "slides")  # Default to slides

    if writing_mode not in MODE_PROMPTS:
        logger.warning(f"Unknown writing mode '{writing_mode}', defaulting to 'slides'.")
        writing_mode = "slides"

    mode_system_prompt = MODE_PROMPTS[writing_mode]

    # Gather context — prefer cleaned_text from state, else fetch from vector DB
    context = state.get("cleaned_text", "")
    if not context:
        context = get_full_context(user_id, paper_id)

    if not context:
        logger.warning("No paper context available for writing assistant.")
        state.setdefault("writing_drafts", {})
        state["writing_drafts"][writing_mode] = "No paper content available to generate a draft."
        state["completed_agents"].append("writing_assistant")
        return state

    # Use a rich but token-safe excerpt
    context_sample = context[:8000]

    prompt = f"""{MASTER_SYSTEM}
{mode_system_prompt}

PAPER CONTENT:
{context_sample}
"""

    draft = ""
    try:
        draft = await generate_with_groq(prompt, temperature=0.5, max_tokens=4000)
    except Exception as e:
        logger.error(f"Error in Writing Assistant Agent ({writing_mode}): {e}")
        draft = f"Failed to generate {writing_mode} draft due to a processing error."

    # Store the draft under the appropriate mode key
    existing_drafts = state.get("writing_drafts") or {}
    existing_drafts[writing_mode] = draft
    state["writing_drafts"] = existing_drafts
    state["completed_agents"].append("writing_assistant")
    logger.info(f"Writing assistant ({writing_mode}) draft generated ({len(draft)} chars).")
    return state
