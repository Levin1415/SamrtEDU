from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class TimeSlot(BaseModel):
    week: Optional[int] = None
    day: Optional[str] = None
    duration: str
    activity: str
    objectives: List[str]
    resources: List[str]

class LessonPlanRequest(BaseModel):
    subject: str
    grade: str
    topic: str
    duration_weeks: Optional[int] = 1
    learning_objectives: List[str]
    teaching_style: Optional[str] = "Interactive"

class InstantLessonRequest(BaseModel):
    prompt: str

class LessonPlanResponse(BaseModel):
    id: Optional[str] = None
    teacher_id: str
    subject: str
    topic: str
    grade: str
    type: str
    content: str
    time_slots: List[Dict[str, Any]]
    created_at: datetime = Field(default_factory=datetime.utcnow)
