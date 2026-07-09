from typing import List, Dict, Any, Optional
from vector_db.query_engine import query_collection, get_full_context
from services.gemini_service import generate_with_gemini
from utils.logger import get_logger

logger = get_logger("rag_pipeline")

def build_context_string(chunks: List[Dict[str, Any]]) -> str:
    """
    Formats retrieved chunks into a clean context block.
    """
    parts = []
    for i, chunk in enumerate(chunks):
        section = chunk['metadata'].get('section', 'Unknown Section')
        parts.append(f"[Excerpt {i+1} | Section: {section}]\n{chunk['text']}")
    return '\n\n---\n\n'.join(parts)

async def run_rag_query(user_id: str,
                          paper_id: str,
                          query: str,
                          n_chunks: int = 5,
                          section_filter: Optional[List[str]] = None,
                          temperature: float = 0.2) -> Dict[str, Any]:
    """
    Executes a RAG query over a paper's vector space.
    Retrieves chunks, builds context, prompts Gemini, and returns answers with citations.
    """
    logger.info(f"Running RAG query for paper {paper_id}. Query: '{query}'")
    
    # 1. Retrieve relevant chunks
    chunks = query_collection(
        user_id=user_id,
        paper_id=paper_id,
        query_text=query,
        n_results=n_chunks,
        section_filter=section_filter
    )
    
    # 2. Build context string (with fallback if no vector match found)
    if not chunks:
        logger.warning("No relevant chunks found above similarity threshold. Falling back to start of document...")
        full_context = get_full_context(user_id, paper_id)
        context = full_context[:8000] if full_context else "No context available."
    else:
        context = build_context_string(chunks)
    
    # 3. Compile prompt
    prompt = f"""You are an expert research analyst. 
Answer the following question based ONLY on the provided research paper context.
If the answer is not in the context, say so clearly.

PAPER CONTEXT:
{context}

QUESTION: {query}

Provide a detailed, accurate answer citing specific parts of the paper."""

    # 4. Generate response
    logger.info("Invoking Gemini for RAG answer generation...")
    answer = await generate_with_gemini(prompt, temperature)
    
    # 5. Format sources output
    sources = []
    for c in chunks:
        sources.append({
            'text': c['text'][:200], 
            'section': c['metadata'].get('section', ''),
            'similarity': c['similarity_score']
        })
        
    logger.info("RAG query complete.")
    return {
        'answer': answer,
        'sources': sources,
        'chunksUsed': len(chunks)
    }
