import json
from graph.graph_state import ResearchGraphState
from services.groq_service import generate_with_groq as generate_with_gemini
from prompts.system_prompts import MASTER_SYSTEM, FLASHCARD_SYSTEM
from vector_db.query_engine import get_full_context
from utils.helpers import clean_json_response
from utils.logger import get_logger

logger = get_logger("flashcard_agent")

async def flashcard_agent(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Executing Flashcard Agent...")
    state["current_agent"] = "flashcards"
    
    user_id = state.get("user_id")
    paper_id = state.get("paper_id")
    
    context = get_full_context(user_id, paper_id)
    
    prompt = f"""{MASTER_SYSTEM}
{FLASHCARD_SYSTEM}

DOCUMENT TEXT:
{context}
"""
    
    flashcards_list = []
    
    try:
        response = await generate_with_gemini(prompt, temperature=0.4, max_tokens=2500)
        cleaned = clean_json_response(response)
        flashcards_list = json.loads(cleaned)
    except Exception as e:
        logger.error(f"Error executing Flashcard Agent: {str(e)}")
        # basic fallback flashcard if parsing failed
        flashcards_list = [
            {
                "question": "What is the primary focus of this paper?",
                "answer": "Study focus and core concepts defined in the paper summary.",
                "difficulty": "easy",
                "topic": "Overview"
            }
        ]
        
    state["flashcards"] = flashcards_list
    state["completed_agents"].append("flashcards")
    return state
