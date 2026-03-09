"""
PostgreSQL version of analytics routes
Replace routes/analytics.py with this file
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from database_postgres import get_db, Submission, Schedule, Assessment
from middleware.auth_middleware_postgres import get_current_user
from datetime import datetime, timedelta
from collections import defaultdict

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/student/{user_id}")
async def get_student_analytics(
    user_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.id != user_id and current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get submissions
    result = await db.execute(
        select(Submission)
        .where(Submission.student_id == user_id)
        .order_by(Submission.submitted_at.desc())
    )
    submissions = result.scalars().all()
    
    # Get schedule blocks
    schedule_result = await db.execute(
        select(Schedule).where(Schedule.user_id == user_id)
    )
    schedule_blocks = schedule_result.scalars().all()
    
    # Scores over time
    scores_over_time = []
    for sub in submissions:
        scores_over_time.append({
            "date": sub.submitted_at.strftime("%Y-%m-%d"),
            "score": sub.score
        })
    
    # Weekly study hours
    weekly_study_hours = {}
    for block in schedule_blocks:
        try:
            week = datetime.strptime(block.date, "%Y-%m-%d").strftime("%Y-W%W")
            start = datetime.strptime(block.start_time, "%H:%M")
            end = datetime.strptime(block.end_time, "%H:%M")
            hours = (end - start).seconds / 3600
            weekly_study_hours[week] = weekly_study_hours.get(week, 0) + hours
        except:
            continue
    
    # Subject breakdown
    subject_breakdown = defaultdict(int)
    for block in schedule_blocks:
        subject_breakdown[block.subject] += 1
    
    return {
        "scores_over_time": scores_over_time,
        "weekly_study_hours": [{"week": k, "hours": v} for k, v in weekly_study_hours.items()],
        "subject_breakdown": [{"subject": k, "count": v} for k, v in subject_breakdown.items()],
        "total_assessments": len(submissions),
        "average_score": sum(s.score for s in submissions) / len(submissions) if submissions else 0
    }

@router.get("/teacher/dashboard")
async def get_teacher_dashboard(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can access this endpoint")
    
    # Get assessments created by teacher
    assessments_result = await db.execute(
        select(Assessment).where(Assessment.teacher_id == current_user.id)
    )
    assessments = assessments_result.scalars().all()
    
    assessment_ids = [a.id for a in assessments]
    
    # Get all submissions for these assessments
    if assessment_ids:
        submissions_result = await db.execute(
            select(Submission).where(Submission.assessment_id.in_(assessment_ids))
        )
        all_submissions = submissions_result.scalars().all()
    else:
        all_submissions = []
    
    # Calculate student scores
    student_scores = defaultdict(list)
    for sub in all_submissions:
        student_scores[sub.student_id].append(sub.score)
    
    avg_scores = {k: sum(v) / len(v) for k, v in student_scores.items()}
    
    top_performers = sorted(avg_scores.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        "total_students": len(student_scores),
        "total_assessments": len(assessments),
        "total_submissions": len(all_submissions),
        "average_class_score": sum(s.score for s in all_submissions) / len(all_submissions) if all_submissions else 0,
        "top_performers": [{"student_id": k, "avg_score": v} for k, v in top_performers]
    }

@router.get("/teacher/{teacher_id}")
async def get_teacher_analytics(
    teacher_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.id != teacher_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get assessments created by teacher
    assessments_result = await db.execute(
        select(Assessment).where(Assessment.teacher_id == teacher_id)
    )
    assessments = assessments_result.scalars().all()
    
    assessment_ids = [a.id for a in assessments]
    
    # Get all submissions for these assessments
    if assessment_ids:
        submissions_result = await db.execute(
            select(Submission).where(Submission.assessment_id.in_(assessment_ids))
        )
        all_submissions = submissions_result.scalars().all()
    else:
        all_submissions = []
    
    # Calculate student scores
    student_scores = defaultdict(list)
    for sub in all_submissions:
        student_scores[sub.student_id].append(sub.score)
    
    avg_scores = {k: sum(v) / len(v) for k, v in student_scores.items()}
    
    top_performers = sorted(avg_scores.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        "total_students": len(student_scores),
        "total_assessments": len(assessments),
        "total_submissions": len(all_submissions),
        "average_class_score": sum(s.score for s in all_submissions) / len(all_submissions) if all_submissions else 0,
        "top_performers": [{"student_id": k, "avg_score": v} for k, v in top_performers]
    }
