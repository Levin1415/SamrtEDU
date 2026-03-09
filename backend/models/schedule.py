from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, time

class ScheduleBlock(BaseModel):
    id: Optional[str] = None
    subject: str
    topic: str
    date: str
    start_time: str
    end_time: str
    priority: str = "Medium"
    color: Optional[str] = None

class ScheduleRequest(BaseModel):
    user_id: str
    blocks: List[ScheduleBlock]

class AddBlockRequest(BaseModel):
    subject: str
    topic: str
    date: str
    start_time: str
    end_time: str
    priority: str = "Medium"

class AIScheduleRequest(BaseModel):
    subjects: List[str]
    goals: List[str]
    available_hours_per_day: int = 4

class DailyPlanRequest(BaseModel):
    date: str
    available_hours: int
    pending_tasks: List[str]
    energy_level: str = "Medium"
    emergencies: Optional[str] = None
