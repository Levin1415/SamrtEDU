from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Badge(BaseModel):
    id: Optional[str] = None
    student_id: str
    type: str
    earned_at: datetime = Field(default_factory=datetime.utcnow)
    assessment_id: Optional[str] = None

class BadgeResponse(BaseModel):
    id: str
    student_id: str
    type: str
    earned_at: datetime
    assessment_id: Optional[str] = None
