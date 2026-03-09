"""
PostgreSQL version of badge service
Replace services/badge_service.py with this file when using PostgreSQL
"""
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from database_postgres import Badge, Submission, ChatHistory, Schedule, AsyncSessionLocal
from datetime import datetime, timedelta

async def check_and_award_badges(student_id: str, assessment_id: str = None, score: float = None):
    """Check and award badges based on student performance and activity"""
    awarded_badges = []
    
    async with AsyncSessionLocal() as db:
        # Score-based badges
        if score is not None and assessment_id:
            if score >= 90:
                badge = await award_badge(db, student_id, "Gold Academic", assessment_id)
                awarded_badges.append(badge)
            elif score >= 75:
                badge = await award_badge(db, student_id, "Silver Scholar", assessment_id)
                awarded_badges.append(badge)
            elif score >= 50:
                badge = await award_badge(db, student_id, "Bronze Learner", assessment_id)
                awarded_badges.append(badge)
        
        # Study streak badge
        study_streak = await check_study_streak(db, student_id)
        if study_streak >= 7:
            existing = await db.execute(
                select(Badge).where(
                    Badge.student_id == student_id,
                    Badge.type == "Study Streak"
                )
            )
            if not existing.scalar_one_or_none():
                badge = await award_badge(db, student_id, "Study Streak")
                awarded_badges.append(badge)
        
        # AI Explorer badge (10+ chat messages)
        chat_count_result = await db.execute(
            select(func.count(ChatHistory.id)).where(ChatHistory.user_id == student_id)
        )
        chat_count = chat_count_result.scalar()
        
        if chat_count >= 10:
            existing = await db.execute(
                select(Badge).where(
                    Badge.student_id == student_id,
                    Badge.type == "AI Explorer"
                )
            )
            if not existing.scalar_one_or_none():
                badge = await award_badge(db, student_id, "AI Explorer")
                awarded_badges.append(badge)
        
        # Lesson Master badge (10+ submissions)
        submission_count_result = await db.execute(
            select(func.count(Submission.id)).where(Submission.student_id == student_id)
        )
        submission_count = submission_count_result.scalar()
        
        if submission_count >= 10:
            existing = await db.execute(
                select(Badge).where(
                    Badge.student_id == student_id,
                    Badge.type == "Lesson Master"
                )
            )
            if not existing.scalar_one_or_none():
                badge = await award_badge(db, student_id, "Lesson Master")
                awarded_badges.append(badge)
        
        # Consistent Planner badge (5+ days scheduled)
        schedule_result = await db.execute(
            select(Schedule).where(Schedule.user_id == student_id)
        )
        schedules = schedule_result.scalars().all()
        
        if len(schedules) >= 5:
            days_scheduled = len(set(s.date for s in schedules))
            if days_scheduled >= 5:
                existing = await db.execute(
                    select(Badge).where(
                        Badge.student_id == student_id,
                        Badge.type == "Consistent Planner"
                    )
                )
                if not existing.scalar_one_or_none():
                    badge = await award_badge(db, student_id, "Consistent Planner")
                    awarded_badges.append(badge)
        
        await db.commit()
    
    return awarded_badges

async def award_badge(db: AsyncSession, student_id: str, badge_type: str, assessment_id: str = None):
    """Award a badge to a student"""
    badge = Badge(
        student_id=student_id,
        type=badge_type,
        earned_at=datetime.utcnow(),
        assessment_id=assessment_id
    )
    
    db.add(badge)
    await db.flush()
    await db.refresh(badge)
    
    return {
        "id": badge.id,
        "_id": badge.id,
        "student_id": badge.student_id,
        "type": badge.type,
        "earned_at": badge.earned_at,
        "assessment_id": badge.assessment_id
    }

async def check_study_streak(db: AsyncSession, student_id: str) -> int:
    """Check the current study streak for a student"""
    result = await db.execute(
        select(Submission)
        .where(Submission.student_id == student_id)
        .order_by(Submission.submitted_at.desc())
        .limit(30)
    )
    submissions = result.scalars().all()
    
    if not submissions:
        return 0
    
    dates = sorted(set(sub.submitted_at.date() for sub in submissions), reverse=True)
    
    streak = 1
    for i in range(len(dates) - 1):
        if (dates[i] - dates[i + 1]).days == 1:
            streak += 1
        else:
            break
    
    return streak

async def get_user_badges(student_id: str):
    """Get all badges for a student"""
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Badge)
            .where(Badge.student_id == student_id)
            .order_by(Badge.earned_at.desc())
        )
        badges = result.scalars().all()
        
        return [{
            "id": b.id,
            "_id": b.id,
            "student_id": b.student_id,
            "type": b.type,
            "earned_at": b.earned_at,
            "assessment_id": b.assessment_id
        } for b in badges]
