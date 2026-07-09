import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.health_routes import router as health_router
from api.paper_routes import router as paper_router
from vector_db.chroma_client import get_chroma_client
from embeddings.model_loader import get_embedding_model
from utils.logger import get_logger

# Initialize logger
logger = get_logger("main")

app = FastAPI(
    title="ResearchMind AI Agent Service",
    description="Microservice containing RAG pipelines, ChromaDB vector indexing, and LangGraph multi-agent systems.",
    version="1.0.0"
)

# CORS configurations
backend_url = os.getenv("BACKEND_URL", "http://localhost:5000")
origins = [
    backend_url,
    "http://localhost:5000",
    "https://ai-researchmind.netlify.app",  # React Dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(health_router)
app.include_router(paper_router)

@app.on_event("startup")
async def startup_event():
    """
    On container startup, eager load model definitions and verify
    persistent vector store connectivity.
    """
    logger.info("Initializing ResearchMind AI Agent Service...")
    
    # 1. Warm up ChromaDB client connection
    try:
        get_chroma_client()
        logger.info("ChromaDB Client verified successfully.")
    except Exception as e:
        logger.critical(f"Startup warning: ChromaDB connection error: {e}")
        
    # 2. Warm up Sentence Transformer model
    try:
        get_embedding_model()
        logger.info("Sentence Transformer Model loaded successfully.")
    except Exception as e:
        logger.critical(f"Startup warning: Model pre-load failure: {e}")
        
    logger.info("ResearchMind AI Agent Service started and ready for queries.")

if __name__ == "__main__":
    port = int(os.getenv("FASTAPI_PORT", 8080))
    # Run server locally
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
