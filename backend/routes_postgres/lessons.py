"""
PostgreSQL version of lessons routes
Replace routes/lessons.py with this file
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from models.lesson import LessonPlanRequest, InstantLessonRequest, LessonPlanResponse
from services.gemini_service import generate_full_lesson_plan, generate_instant_lesson
from database_postgres import get_db, LessonPlan
from middleware.auth_middleware_postgres import get_current_teacher
from datetime import datetime

router = APIRouter(prefix="/api/lessons", tags=["lessons"])

@router.post("/generate")
async def generate(request: LessonPlanRequest, current_user = Depends(get_current_teacher)):
    """Generate lesson plan - alias for generate-full"""
    try:
        result = await generate_full_lesson_plan(
            request.subject,
            request.grade,
            request.topic,
            request.duration_weeks,
            request.learning_objectives,
            request.teaching_style
        )
        
        return {
            "content": result.get("overview", ""),
            "time_slots": result.get("weeks", []),
            "success": True
        }
    
    except Exception as e:
        import traceback
        print(f"Error generating lesson plan: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to generate lesson plan: {str(e)}")

@router.post("/generate-full")
async def generate_full(request: LessonPlanRequest, current_user = Depends(get_current_teacher)):
    try:
        result = await generate_full_lesson_plan(
            request.subject,
            request.grade,
            request.topic,
            request.duration_weeks,
            request.learning_objectives,
            request.teaching_style
        )
        
        return {
            "content": result.get("overview", ""),
            "time_slots": result.get("weeks", []),
            "success": True
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-instant")
async def generate_instant(request: InstantLessonRequest, current_user = Depends(get_current_teacher)):
    try:
        result = await generate_instant_lesson(request.prompt)
        
        return {
            "content": result,
            "success": True
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save")
async def save_lesson(
    subject: str,
    topic: str,
    grade: str,
    lesson_type: str,
    content: str,
    time_slots: list,
    current_user = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db)
):
    lesson = LessonPlan(
        teacher_id=current_user.id,
        subject=subject,
        topic=topic,
        grade=grade,
        type=lesson_type,
        content=content,
        time_slots=time_slots,
        created_at=datetime.utcnow()
    )
    
    db.add(lesson)
    await db.commit()
    await db.refresh(lesson)
    
    return {
        "id": lesson.id,
        "message": "Lesson plan saved successfully"
    }

@router.get("")
async def get_lessons(
    current_user = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(LessonPlan)
        .where(LessonPlan.teacher_id == current_user.id)
        .order_by(LessonPlan.created_at.desc())
    )
    lessons = result.scalars().all()
    
    return [{
        "id": l.id,
        "_id": l.id,
        "teacher_id": l.teacher_id,
        "subject": l.subject,
        "topic": l.topic,
        "grade": l.grade,
        "type": l.type,
        "content": l.content,
        "time_slots": l.time_slots,
        "created_at": l.created_at
    } for l in lessons]

@router.delete("/{lesson_id}")
async def delete_lesson(
    lesson_id: str,
    current_user = Depends(get_current_teacher),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(LessonPlan).where(LessonPlan.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()
    
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    if lesson.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.execute(delete(LessonPlan).where(LessonPlan.id == lesson_id))
    await db.commit()
    
    return {"message": "Lesson deleted successfully"}
