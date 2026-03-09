from fastapi import APIRouter, HTTPException, Depends
from models.lesson import LessonPlanRequest, InstantLessonRequest, LessonPlanResponse
from services.gemini_service import generate_full_lesson_plan, generate_instant_lesson
from database import lesson_plans_collection
from middleware.auth_middleware import get_current_teacher
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/lessons", tags=["lessons"])

@router.post("/generate-full")
async def generate_full(request: LessonPlanRequest, current_user: dict = Depends(get_current_teacher)):
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
async def generate_instant(request: InstantLessonRequest, current_user: dict = Depends(get_current_teacher)):
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
    current_user: dict = Depends(get_current_teacher)
):
    lesson = {
        "teacher_id": str(current_user["_id"]),
        "subject": subject,
        "topic": topic,
        "grade": grade,
        "type": lesson_type,
        "content": content,
        "time_slots": time_slots,
        "created_at": datetime.utcnow()
    }
    
    result = await lesson_plans_collection.insert_one(lesson)
    lesson["_id"] = result.inserted_id
    
    return {
        "id": str(lesson["_id"]),
        "message": "Lesson plan saved successfully"
    }

@router.get("")
async def get_lessons(current_user: dict = Depends(get_current_teacher)):
    lessons = await lesson_plans_collection.find(
        {"teacher_id": str(current_user["_id"])}
    ).sort("created_at", -1).to_list(100)
    
    for lesson in lessons:
        lesson["id"] = str(lesson.pop("_id"))
    
    return lessons

@router.delete("/{lesson_id}")
async def delete_lesson(lesson_id: str, current_user: dict = Depends(get_current_teacher)):
    lesson = await lesson_plans_collection.find_one({"_id": ObjectId(lesson_id)})
    
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    if lesson["teacher_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await lesson_plans_collection.delete_one({"_id": ObjectId(lesson_id)})
    
    return {"message": "Lesson deleted successfully"}
