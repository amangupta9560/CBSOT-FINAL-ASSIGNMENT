from typing import List
from embeddings.model_loader import get_embedding_model
from utils.logger import get_logger

logger = get_logger("embedder")

def generate_embeddings(texts: List[str], batch_size: int = 32) -> List[List[float]]:
    """
    Generates embedding vectors for a list of texts using the singleton model.
    """
    if not texts:
        return []
    
    logger.debug(f"Generating embeddings for {len(texts)} chunks. Batch size: {batch_size}")
    model = get_embedding_model()
    
    # Generate embeddings
    embeddings = model.encode(
        texts,
        batch_size=batch_size,
        show_progress_bar=False,
        normalize_embeddings=True
    )
    
    # Convert numpy ndarray to nested python list
    return embeddings.tolist()

def generate_single_embedding(text: str) -> List[float]:
    """
    Generates a single embedding vector for a query string.
    """
    return generate_embeddings([text])[0]
