import os
from sentence_transformers import SentenceTransformer
from utils.logger import get_logger

logger = get_logger("model_loader")

_model = None

def get_embedding_model():
    """
    Returns the loaded SentenceTransformer model. Implements a lazy singleton pattern.
    """
    global _model
    if _model is None:
        model_name = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
        logger.info(f"Loading Sentence Transformer model '{model_name}'...")
        try:
            # Load model onto CPU (or GPU if available, sentence-transformers does this automatically)
            _model = SentenceTransformer(model_name)
            dimensions = _model.get_sentence_embedding_dimension()
            logger.info(f"Model loaded successfully. Embedding dimensions: {dimensions}")
        except Exception as e:
            logger.error(f"Error loading embedding model: {e}")
            raise e
    return _model
