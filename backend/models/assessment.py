from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class Question(BaseModel):
    question: str
    type: str
    options: Optional[List[str]] = None
    correct_answer: str

class AssessmentGenerateRequest(BaseModel):
    subject: str
    topic: str
    grade: str
    num_questions: int = 10
    question_types: str = "Mix"

class AssessmentCreate(BaseModel):
    teacher_id: str
    subject: str
    topic: str
    grade: str
    questions: List[Question]
    assigned_to: List[str] = []

class AssessmentResponse(BaseModel):
    id: str
    teacher_id: str
    subject: str
    topic: str
    grade: str
    questions: List[Question]
    assigned_to: List[str]
    created_at: datetime

class SubmitAnswersRequest(BaseModel):
    assessment_id: str
    answers: List[str]

class GradeRequest(BaseModel):
    questions: List[Question]
    answers: List[str]

class SubmissionResponse(BaseModel):
    id: str
    assessment_id: str
    student_id: str
    score: float
    feedback: List[Dict[str, Any]]
    badge_earned: Optional[str] = None
    submitted_at: datetime
