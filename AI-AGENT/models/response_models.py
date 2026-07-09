from pydantic import BaseModel
from typing import List, Dict, Any

class ProcessingResponse(BaseModel):
    success: bool
    message: str
    paperId: str

class QAResponse(BaseModel):
    success: bool
    answer: str
    sources: List[Dict[str, Any]]
    confidence: float

class AgentResponse(BaseModel):
    success: bool
    agentType: str
    data: Dict[str, Any]
