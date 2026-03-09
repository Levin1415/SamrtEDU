from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ChatMessage(BaseModel):
    role: str
    content: str
    question_type: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    message: str
    language: str = "English"
    history: List[ChatMessage] = []

class TranscribeRequest(BaseModel):
    audio: bytes

class QuestionTypeRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    response: str
    question_type: Optional[str] = None
