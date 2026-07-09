import os
from datetime import datetime
from fastapi import APIRouter
from vector_db.chroma_client import get_chroma_client
from utils.logger import get_logger

logger = get_logger("health_routes")
router = APIRouter(prefix="/api/health", tags=["Health"])

@router.get("")
async def health_check():
    """
    Service health check reporting statuses, timestamps, models configurations,
    and ChromaDB connectivity.
    """
    logger.debug("Health check requested.")
    
    chroma_status = "error"
    try:
        # Check connection to ChromaDB
        client = get_chroma_client()
        # Ping check
        client.heartbeat()
        chroma_status = "connected"
    except Exception as e:
        logger.error(f"ChromaDB health check failed: {e}")
        
    return {
        "status": "healthy",
        "service": "ResearchMind AI Agent",
        "timestamp": datetime.utcnow().isoformat(),
        "models": {
            "embedding": os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"),
            "llm": os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        },
        "chromadb": chroma_status
    }
