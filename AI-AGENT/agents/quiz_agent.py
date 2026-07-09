import json
from graph.graph_state import ResearchGraphState
from services.groq_service import generate_with_groq as generate_with_gemini
from prompts.system_prompts import MASTER_SYSTEM, QUIZ_SYSTEM
from vector_db.query_engine import get_full_context
from utils.helpers import clean_json_response
from utils.logger import get_logger

logger = get_logger("quiz_agent")

async def quiz_agent(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Executing Quiz Agent...")
    state["current_agent"] = "quiz"
    
    user_id = state.get("user_id")
    paper_id = state.get("paper_id")
    
    context = get_full_context(user_id, paper_id)
    
    prompt = f"""{MASTER_SYSTEM}
{QUIZ_SYSTEM}

DOCUMENT TEXT:
{context}
"""
    
    quiz_list = []
    
    try:
        response = await generate_with_gemini(prompt, temperature=0.3, max_tokens=2500)
        cleaned = clean_json_response(response)
        quiz_list = json.loads(cleaned)
    except Exception as e:
        logger.error(f"Error executing Quiz Agent: {str(e)}")
        quiz_list = [
            {
                "question": "What is the key takeaway of this research paper?",
                "options": ["A) A core discovery", "B) An unrelated topic", "C) None of the above", "D) All of the above"],
                "correctAnswer": "A",
                "explanation": "The paper focuses on delivering the main research findings outlined in the summary."
            }
        ]
        
    state["quiz"] = quiz_list
    state["completed_agents"].append("quiz")
    return state
