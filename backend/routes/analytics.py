from fastapi import APIRouter, HTTPException, Depends
from database import submissions_collection, schedules_collection, assessments_collection
from middleware.auth_middleware import get_current_user
from datetime import datetime, timedelta
from collections import defaultdict

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/student/{user_id}")
async def get_student_analytics(user_id: str, current_user: dict = Depends(get_current_user)):
    if str(current_user["_id"]) != user_id and current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    submissions = await submissions_collection.find(
        {"student_id": user_id}
    ).sort("submitted_at", -1).to_list(100)
    
    schedule = await schedules_collection.find_one({"user_id": user_id})
    
    scores_over_time = []
    for sub in submissions:
        scores_over_time.append({
            "date": sub["submitted_at"].strftime("%Y-%m-%d"),
            "score": sub["score"]
        })
    
    weekly_study_hours = {}
    if schedule:
        for block in schedule.get("blocks", []):
            week = datetime.strptime(block["date"], "%Y-%m-%d").strftime("%Y-W%W")
            start = datetime.strptime(block["start_time"], "%H:%M")
            end = datetime.strptime(block["end_time"], "%H:%M")
            hours = (end - start).seconds / 3600
            weekly_study_hours[week] = weekly_study_hours.get(week, 0) + hours
    
    subject_breakdown = defaultdict(int)
    if schedule:
        for block in schedule.get("blocks", []):
            subject_breakdown[block["subject"]] += 1
    
    return {
        "scores_over_time": scores_over_time,
        "weekly_study_hours": [{"week": k, "hours": v} for k, v in weekly_study_hours.items()],
        "subject_breakdown": [{"subject": k, "count": v} for k, v in subject_breakdown.items()],
        "total_assessments": len(submissions),
        "average_score": sum(s["score"] for s in submissions) / len(submissions) if submissions else 0
    }

@router.get("/teacher/{teacher_id}")
async def get_teacher_analytics(teacher_id: str, current_user: dict = Depends(get_current_user)):
    if str(current_user["_id"]) != teacher_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    assessments = await assessments_collection.find(
        {"teacher_id": teacher_id}
    ).to_list(100)
    
    assessment_ids = [str(a["_id"]) for a in assessments]
    
    all_submissions = await submissions_collection.find(
        {"assessment_id": {"$in": assessment_ids}}
    ).to_list(1000)
    
    student_scores = defaultdict(list)
    for sub in all_submissions:
        student_scores[sub["student_id"]].append(sub["score"])
    
    avg_scores = {k: sum(v) / len(v) for k, v in student_scores.items()}
    
    top_performers = sorted(avg_scores.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        "total_students": len(student_scores),
        "total_assessments": len(assessments),
        "total_submissions": len(all_submissions),
        "average_class_score": sum(s["score"] for s in all_submissions) / len(all_submissions) if all_submissions else 0,
        "top_performers": [{"student_id": k, "avg_score": v} for k, v in top_performers]
    }
