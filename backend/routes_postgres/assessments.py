"""
PostgreSQL version of assessments routes
Replace routes/assessments.py with this file
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.assessment import (
    AssessmentGenerateRequest, AssessmentCreate, SubmitAnswersRequest,
    GradeRequest, AssessmentResponse, SubmissionResponse
)
from services.openai_service import generate_assessment
from services.gemini_service import grade_assessment
from services.badge_service_postgres import check_and_award_badges
from database_postgres import get_db, Assessment, Submission
from middleware.auth_middleware_postgres import get_current_user, get_current_teacher, get_current_student
from datetime import datetime

router = APIRouter(prefix="/api/assessments", tags=["assessments"])

@router.post("/generate")
async def generate(request: AssessmentGenerateRequest, current_user = Depends(get_current_teacher)):
    try:
        questions = await generate_assessment(
            request.subject,
            request.topic,
            request.grade,
            request.num_questions,
            request.question_types
        )
        
        return {"questions": questions, "success": True}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save")
async def save_assessment(
    assessment: AssessmentCreate,
    current_user = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db)
):
    new_assessment = Assessment(
        teacher_id=current_user.id,
        subject=assessment.subject,
        topic=assessment.topic,
        grade=assessment.grade,
        questions=assessment.questions,
        assigned_to=assessment.assigned_to,
        created_at=datetime.utcnow()
    )
    
    db.add(new_assessment)
    await db.commit()
    await db.refresh(new_assessment)
    
    return {
        "id": new_assessment.id,
        "message": "Assessment saved successfully"
    }

@router.get("/teacher")
async def get_teacher_assessments(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all assessments created by the current teacher"""
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can access this endpoint")
    
    result = await db.execute(
        select(Assessment)
        .where(Assessment.teacher_id == current_user.id)
        .order_by(Assessment.created_at.desc())
    )
    
    assessments = result.scalars().all()
    
    return [{
        "id": a.id,
        "_id": a.id,
        "teacher_id": a.teacher_id,
        "subject": a.subject,
        "topic": a.topic,
        "grade": a.grade,
        "questions": a.questions,
        "assigned_to": a.assigned_to,
        "created_at": a.created_at
    } for a in assessments]

@router.get("")
async def get_assessments(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role == "teacher":
        result = await db.execute(
            select(Assessment)
            .where(Assessment.teacher_id == current_user.id)
            .order_by(Assessment.created_at.desc())
        )
    else:
        # Student: get assessments assigned to them or "all"
        # For JSON type, we need to convert to text and use LIKE or use a simpler approach
        from sqlalchemy import cast, String, or_, func, text
        
        # Get all assessments and filter in Python since JSON operators are limited
        result = await db.execute(
            select(Assessment).order_by(Assessment.created_at.desc())
        )
        all_assessments = result.scalars().all()
        
        # Filter assessments assigned to current user or "all"
        assessments = []
        for a in all_assessments:
            assigned_to = a.assigned_to if isinstance(a.assigned_to, list) else []
            if len(assigned_to) == 0 or current_user.id in assigned_to or "all" in assigned_to:
                assessments.append(a)
    
    return [{
        "id": a.id,
        "_id": a.id,
        "teacher_id": a.teacher_id,
        "subject": a.subject,
        "topic": a.topic,
        "grade": a.grade,
        "questions": a.questions,
        "assigned_to": a.assigned_to,
        "created_at": a.created_at
    } for a in assessments]

@router.get("/{assessment_id}")
async def get_assessment(
    assessment_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Assessment).where(Assessment.id == assessment_id)
    )
    assessment = result.scalar_one_or_none()
    
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    return {
        "id": assessment.id,
        "_id": assessment.id,
        "teacher_id": assessment.teacher_id,
        "subject": assessment.subject,
        "topic": assessment.topic,
        "grade": assessment.grade,
        "questions": assessment.questions,
        "assigned_to": assessment.assigned_to,
        "created_at": assessment.created_at
    }

@router.post("/submit")
async def submit_assessment(
    request: SubmitAnswersRequest,
    current_user = Depends(get_current_student),
    db: AsyncSession = Depends(get_db)
):
    # Get assessment
    result = await db.execute(
        select(Assessment).where(Assessment.id == request.assessment_id)
    )
    assessment = result.scalar_one_or_none()
    
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    try:
        grading_result = await grade_assessment(assessment.questions, request.answers)
        
        percentage = grading_result["percentage"]
        badge_earned = None
        
        if percentage >= 90:
            badge_earned = "Gold Academic"
        elif percentage >= 75:
            badge_earned = "Silver Scholar"
        elif percentage >= 50:
            badge_earned = "Bronze Learner"
        
        submission = Submission(
            assessment_id=request.assessment_id,
            student_id=current_user.id,
            answers=request.answers,
            score=grading_result["percentage"],
            feedback=grading_result["results"],
            badge_earned=badge_earned,
            submitted_at=datetime.utcnow()
        )
        
        db.add(submission)
        await db.commit()
        await db.refresh(submission)
        
        awarded_badges = await check_and_award_badges(
            current_user.id,
            request.assessment_id,
            percentage
        )
        
        return {
            "id": submission.id,
            "score": grading_result["percentage"],
            "total_score": grading_result["total_score"],
            "max_score": grading_result["max_score"],
            "feedback": grading_result["results"],
            "overall_feedback": grading_result.get("overall_feedback", ""),
            "badge_earned": badge_earned,
            "awarded_badges": [badge["type"] for badge in awarded_badges]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/grade")
async def grade(request: GradeRequest, current_user = Depends(get_current_teacher)):
    try:
        result = await grade_assessment(
            [q.dict() for q in request.questions],
            request.answers
        )
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
