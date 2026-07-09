import os
import json
import httpx
from fastapi import APIRouter, Header, HTTPException, BackgroundTasks, Query
from typing import Optional, List
from models.request_models import ProcessPaperRequest, QARequest, AgentRequest
from graph.graph_builder import build_research_graph
from utils.logger import get_logger

logger = get_logger("paper_routes")
router = APIRouter(prefix="/api/papers", tags=["Papers"])

INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")

def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """
    Dependency helper verifying internal API Key authorization.
    """
    if not x_api_key or x_api_key != INTERNAL_API_KEY:
        logger.error("Unauthorized API attempt. API key mismatch.")
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key header")

async def notify_backend_callback(payload: dict):
    """
    HTTP POST helper sending status updates back to Node Express callback endpoint.
    """
    url = f"{BACKEND_URL}/api/papers/status-callback"
    logger.info(f"Sending callback notification to backend: {url}")
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": INTERNAL_API_KEY
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            res = await client.post(url, json=payload, headers=headers)
            logger.info(f"Backend callback responded with status: {res.status_code}")
            return res.status_code == 200
        except Exception as e:
            logger.error(f"Failed to transmit callback to backend: {e}")
            return False

async def process_paper_background(req: ProcessPaperRequest):
    """
    Asynchronous paper ingestion running the full sequential multi-agent LangGraph.
    """
    paper_id = req.paperId
    user_id = req.userId
    url = req.cloudinaryUrl

    logger.info(f"--- Starting background LangGraph process for paper: {paper_id} ---")
    
    state = {
        "paper_id": paper_id,
        "user_id": user_id,
        "cloudinary_url": url,
        "task_type": "full_process",
        "user_query": "",
        "writing_mode": "",
        "additional_paper_ids": [],
        "pdf_bytes": b"",
        "raw_text": "",
        "cleaned_text": "",
        "section_map": {},
        "chunks": [],
        "embeddings_stored": False,
        "retrieved_chunks": [],
        "paper_metadata": {},
        "summary": {},
        "citations": {},
        "research_gaps": {},
        "future_work": {},
        "experiment_suggestions": {},
        "keywords": {},
        "mind_map": {},
        "equations": {},
        "highlights": {},
        "flashcards": [],
        "quiz": [],
        "research_ideas": [],
        "literature_review": "",
        "figures": [],
        "writing_drafts": {},
        "qa_answer": {},
        "error": None,
        "completed_agents": [],
        "current_agent": "start"
    }
    
    try:
        graph = build_research_graph()
        await graph.ainvoke(state)
        logger.info(f"--- Completed background LangGraph process successfully for paper: {paper_id} ---")
    except Exception as e:
        logger.error(f"Background paper processing encountered failure for {paper_id}: {e}")
        failure_payload = {
            "paperId": paper_id,
            "status": "failed",
            "error": str(e)
        }
        await notify_backend_callback(failure_payload)

async def run_agent_task_background(req: AgentRequest):
    """
    Asynchronous runner for custom multi-paper literature reviews or single agent regenerations.
    """
    paper_id = req.paperId
    user_id = req.userId
    agent_type = req.agentType
    additional_ids = req.additionalPaperIds or []
    
    logger.info(f"--- Starting background agent task ({agent_type}) for paper: {paper_id} ---")
    
    state = {
        "paper_id": paper_id,
        "user_id": user_id,
        "cloudinary_url": "",  # Not needed for re-runs
        "task_type": agent_type,
        "user_query": "",
        "writing_mode": req.writingMode or "slides",
        "additional_paper_ids": additional_ids,
        "pdf_bytes": b"",
        "raw_text": "",
        "cleaned_text": "",
        "section_map": {},
        "chunks": [],
        "embeddings_stored": True,
        "retrieved_chunks": [],
        "paper_metadata": {},
        "summary": {},
        "citations": {},
        "research_gaps": {},
        "future_work": {},
        "experiment_suggestions": {},
        "keywords": {},
        "mind_map": {},
        "equations": {},
        "highlights": {},
        "flashcards": [],
        "quiz": [],
        "research_ideas": [],
        "literature_review": "",
        "figures": [],
        "writing_drafts": {},
        "qa_answer": {},
        "error": None,
        "completed_agents": [],
        "current_agent": "start"
    }
    
    try:
        if agent_type == "literature_review":
            # For lit reviews, run comparative review node chain
            graph = build_research_graph()
            await graph.ainvoke(state)
        else:
            # Map single agent on-demand tasks
            from agents.flashcard_agent import flashcard_agent
            from agents.quiz_agent import quiz_agent
            from agents.mindmap_agent import mindmap_agent
            from agents.idea_generator_agent import idea_generator_agent
            from agents.writing_assistant_agent import writing_assistant_agent
            from agents.figure_agent import figure_agent
            
            agent_map = {
                "flashcards": flashcard_agent,
                "quiz": quiz_agent,
                "mindmap": mindmap_agent,
                "ideas": idea_generator_agent,
                "writing_assistant": writing_assistant_agent,
                "figures": figure_agent
            }
            
            if agent_type not in agent_map:
                raise ValueError(f"On-demand regeneration not supported for agent type: {agent_type}")
                
            agent_func = agent_map[agent_type]
            updated_state = await agent_func(state)
            
            # Map outputs
            agent_outputs = {}
            if agent_type == "flashcards":
                agent_outputs["flashcards"] = updated_state.get("flashcards", [])
            elif agent_type == "quiz":
                agent_outputs["quiz"] = updated_state.get("quiz", [])
            elif agent_type == "mindmap":
                agent_outputs["mind_map"] = updated_state.get("mind_map", {})
            elif agent_type == "ideas":
                agent_outputs["research_ideas"] = updated_state.get("research_ideas", [])
            elif agent_type == "writing_assistant":
                agent_outputs["writing_drafts"] = updated_state.get("writing_drafts", {})
            elif agent_type == "figures":
                agent_outputs["figures"] = updated_state.get("figures", [])
                
            payload = {
                "paperId": paper_id,
                "status": "ready",
                "agentOutputs": agent_outputs
            }
            await notify_backend_callback(payload)
            
        logger.info(f"--- Completed agent task successfully for paper: {paper_id} ---")
    except Exception as e:
        logger.error(f"Background agent task encountered failure for {paper_id}: {e}")
        failure_payload = {
            "paperId": paper_id,
            "status": "failed",
            "error": str(e)
        }
        await notify_backend_callback(failure_payload)

@router.post("/process-paper", status_code=202)
async def process_paper(
    req: ProcessPaperRequest,
    background_tasks: BackgroundTasks,
    x_api_key: Optional[str] = Header(None)
):
    """
    Secured route triggering async document parsing, indexing, and multi-agent workflow.
    """
    verify_api_key(x_api_key)
    logger.info(f"Process paper endpoint triggered for paperId: {req.paperId}")
    background_tasks.add_task(process_paper_background, req)
    return {
        "success": True,
        "message": "Processing started"
    }

@router.post("/agent-task", status_code=202)
async def trigger_agent_task(
    req: AgentRequest,
    background_tasks: BackgroundTasks,
    x_api_key: Optional[str] = Header(None)
):
    """
    Secured route triggering custom multi-document review or agent re-runs.
    """
    verify_api_key(x_api_key)
    logger.info(f"Agent task triggered. Type: {req.agentType}, PaperId: {req.paperId}")
    background_tasks.add_task(run_agent_task_background, req)
    return {
        "success": True,
        "message": "Agent task started"
    }

@router.get("/{paper_id}/query")
async def query_paper(
    paper_id: str,
    userId: str,
    query: str,
    nResults: int = 5
):
    """
    Runs the grounded QA agent to answer user queries using the paper's vector index.
    """
    logger.info(f"QA query request. PaperId: {paper_id}, Query: '{query}'")
    
    state = {
        "paper_id": paper_id,
        "user_id": userId,
        "cloudinary_url": "",
        "task_type": "qa",
        "user_query": query,
        "writing_mode": "",
        "additional_paper_ids": [],
        "pdf_bytes": b"",
        "raw_text": "",
        "cleaned_text": "",
        "section_map": {},
        "chunks": [],
        "embeddings_stored": True,
        "retrieved_chunks": [],
        "paper_metadata": {},
        "summary": {},
        "citations": {},
        "research_gaps": {},
        "future_work": {},
        "experiment_suggestions": {},
        "keywords": {},
        "mind_map": {},
        "equations": {},
        "highlights": {},
        "flashcards": [],
        "quiz": [],
        "research_ideas": [],
        "literature_review": "",
        "figures": [],
        "writing_drafts": {},
        "qa_answer": {},
        "error": None,
        "completed_agents": [],
        "current_agent": "start",
        "writing_mode": ""
    }
    
    try:
        graph = build_research_graph()
        result = await graph.ainvoke(state)
        qa_ans = result.get("qa_answer", {})
        return {
            "success": True,
            "answer": qa_ans.get("answer", "This is not directly addressed in the paper."),
            "confidence": qa_ans.get("confidence", 0.0),
            "sources": qa_ans.get("sources", [])
        }
    except Exception as e:
        logger.error(f"QA query execution error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
