from fastapi import APIRouter, HTTPException, Depends
from models.assessment import (
    AssessmentGenerateRequest, AssessmentCreate, SubmitAnswersRequest,
    GradeRequest, AssessmentResponse, SubmissionResponse
)
from services.openai_service import generate_assessment
from services.gemini_service import grade_assessment
from services.badge_service import check_and_award_badges
from database import assessments_collection, submissions_collection
from middleware.auth_middleware import get_current_user, get_current_teacher, get_current_student
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/assessments", tags=["assessments"])

@router.post("/generate")
async def generate(request: AssessmentGenerateRequest, current_user: dict = Depends(get_current_teacher)):
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
async def save_assessment(assessment: AssessmentCreate, current_user: dict = Depends(get_current_teacher)):
    assessment_dict = assessment.dict()
    assessment_dict["teacher_id"] = str(current_user["_id"])
    assessment_dict["created_at"] = datetime.utcnow()
    
    result = await assessments_collection.insert_one(assessment_dict)
    
    return {
        "id": str(result.inserted_id),
        "message": "Assessment saved successfully"
    }

@router.get("")
async def get_assessments(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "teacher":
        assessments = await assessments_collection.find(
            {"teacher_id": str(current_user["_id"])}
        ).sort("created_at", -1).to_list(100)
    else:
        assessments = await assessments_collection.find(
            {"assigned_to": {"$in": [str(current_user["_id"]), "all"]}}
        ).sort("created_at", -1).to_list(100)
    
    for assessment in assessments:
        assessment["id"] = str(assessment.pop("_id"))
    
    return assessments

@router.get("/{assessment_id}")
async def get_assessment(assessment_id: str, current_user: dict = Depends(get_current_user)):
    assessment = await assessments_collection.find_one({"_id": ObjectId(assessment_id)})
    
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    assessment["id"] = str(assessment.pop("_id"))
    
    return assessment

@router.post("/submit")
async def submit_assessment(request: SubmitAnswersRequest, current_user: dict = Depends(get_current_student)):
    assessment = await assessments_collection.find_one({"_id": ObjectId(request.assessment_id)})
    
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    try:
        grading_result = await grade_assessment(assessment["questions"], request.answers)
        
        percentage = grading_result["percentage"]
        badge_earned = None
        
        if percentage >= 90:
            badge_earned = "Gold Academic"
        elif percentage >= 75:
            badge_earned = "Silver Scholar"
        elif percentage >= 50:
            badge_earned = "Bronze Learner"
        
        submission = {
            "assessment_id": request.assessment_id,
            "student_id": str(current_user["_id"]),
            "answers": request.answers,
            "score": grading_result["percentage"],
            "feedback": grading_result["results"],
            "badge_earned": badge_earned,
            "submitted_at": datetime.utcnow()
        }
        
        result = await submissions_collection.insert_one(submission)
        submission["_id"] = result.inserted_id
        
        awarded_badges = await check_and_award_badges(
            str(current_user["_id"]),
            request.assessment_id,
            percentage
        )
        
        return {
            "id": str(submission["_id"]),
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
async def grade(request: GradeRequest, current_user: dict = Depends(get_current_teacher)):
    try:
        result = await grade_assessment(
            [q.dict() for q in request.questions],
            request.answers
        )
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
