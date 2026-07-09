from pydantic import BaseModel
from typing import Optional, List

class ProcessPaperRequest(BaseModel):
    paperId: str
    userId: str
    cloudinaryUrl: str
    fileName: str

class QARequest(BaseModel):
    paperId: str
    userId: str
    query: str
    sessionId: Optional[str] = None

class AgentRequest(BaseModel):
    paperId: str
    userId: str
    agentType: str  # 'flashcards', 'quiz', 'mindmap', 'ideas', 'literature_review', 'writing_assistant', 'figures'
    additionalPaperIds: Optional[List[str]] = None  # for multi-paper tasks
    writingMode: Optional[str] = "slides"  # 'patent' | 'grant' | 'slides' — for writing_assistant tasks
