from typing import TypedDict, Optional, List

class ResearchGraphState(TypedDict):
    # Input parameters
    paper_id: str
    user_id: str
    cloudinary_url: str
    task_type: str  # 'full_process' | 'qa' | 'flashcards' | 'quiz' | 'mindmap' | 'ideas' | 'literature_review' | 'writing_assistant' | 'figures'
    user_query: str
    additional_paper_ids: List[str]
    writing_mode: str  # 'patent' | 'grant' | 'slides' — used by writing_assistant_agent
    
    # Extracted and structured content
    pdf_bytes: bytes
    raw_text: str
    cleaned_text: str
    section_map: dict
    chunks: List[dict]
    embeddings_stored: bool
    retrieved_chunks: List[dict]
    
    # Outputs of the agents
    paper_metadata: dict
    summary: dict
    citations: dict
    research_gaps: dict
    future_work: dict
    experiment_suggestions: dict
    keywords: dict
    mind_map: dict
    equations: dict
    highlights: dict
    flashcards: List[dict]
    quiz: List[dict]
    research_ideas: List[dict]
    literature_review: str
    figures: List[dict]
    writing_drafts: dict
    qa_answer: dict
    
    # Control flags and tracking
    error: Optional[str]
    completed_agents: List[str]
    current_agent: str
