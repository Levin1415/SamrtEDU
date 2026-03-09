from pydantic import BaseModel
from typing import List, Optional

class TimetableSlot(BaseModel):
    id: Optional[str] = None
    day: str
    start_time: str
    end_time: str
    subject: str
    room: Optional[str] = None
    lecturer: Optional[str] = None

class TimetableRequest(BaseModel):
    user_id: str
    slots: List[TimetableSlot]

class AddSlotRequest(BaseModel):
    day: str
    start_time: str
    end_time: str
    subject: str
    room: Optional[str] = None
    lecturer: Optional[str] = None

class ConflictCheckRequest(BaseModel):
    slots: List[TimetableSlot]
