import json
from graph.graph_state import ResearchGraphState
from services.groq_service import generate_with_groq as generate_with_gemini
from prompts.system_prompts import MASTER_SYSTEM, QA_SYSTEM
from vector_db.query_engine import query_collection, get_full_context
from utils.helpers import clean_json_response
from utils.logger import get_logger

logger = get_logger("qa_agent")

async def qa_agent(state: ResearchGraphState) -> ResearchGraphState:
    logger.info("Executing QA Agent...")
    state["current_agent"] = "qa"
    
    user_id = state.get("user_id")
    paper_id = state.get("paper_id")
    query = state.get("user_query", "")
    
    if not query:
        state["qa_answer"] = {
            "answer": "No query provided.",
            "confidence": 0.0,
            "sources": []
        }
        state["completed_agents"].append("qa")
        return state
        
    # Retrieve top 5 matching chunks
    chunks = query_collection(
        user_id=user_id,
        paper_id=paper_id,
        query_text=query,
        n_results=5
    )
    
    if not chunks:
        full_context = get_full_context(user_id, paper_id)
        context = full_context[:8000] if full_context else "No context available."
    else:
        parts = []
        for i, chunk in enumerate(chunks):
            section = chunk['metadata'].get('section', 'Unknown Section')
            parts.append(f"[Excerpt {i+1} | Section: {section}]\n{chunk['text']}")
        context = '\n\n---\n\n'.join(parts)
        
    prompt = f"""{MASTER_SYSTEM}
{QA_SYSTEM}

PAPER CONTEXT:
{context}

USER QUERY:
{query}
"""
    
    qa_result = {
        "answer": "This is not directly addressed in the paper.",
        "confidence": 0.0,
        "sources": []
    }
    
    try:
        response = await generate_with_gemini(prompt, temperature=0.2, max_tokens=1000)
        cleaned = clean_json_response(response)
        qa_result = json.loads(cleaned)
    except Exception as e:
        logger.error(f"Error executing QA Agent: {str(e)}")
        
    state["qa_answer"] = qa_result
    state["completed_agents"].append("qa")
    return state
