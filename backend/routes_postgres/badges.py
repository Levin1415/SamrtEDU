"""
PostgreSQL version of badges routes
Replace routes/badges.py with this file
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from services.badge_service_postgres import get_user_badges, check_and_award_badges
from database_postgres import get_db, Badge
from middleware.auth_middleware_postgres import get_current_user

router = APIRouter(prefix="/api/badges", tags=["badges"])

@router.get("")
async def get_user_badges(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get badges for the current user"""
    result = await db.execute(
        select(Badge)
        .where(Badge.student_id == current_user.id)
        .order_by(Badge.earned_at.desc())
    )
    badges = result.scalars().all()
    
    badge_list = [{
        "id": b.id,
        "_id": b.id,
        "student_id": b.student_id,
        "type": b.type,
        "earned_at": b.earned_at,
        "assessment_id": b.assessment_id
    } for b in badges]
    
    badge_counts = {}
    for badge in badge_list:
        badge_type = badge["type"]
        badge_counts[badge_type] = badge_counts.get(badge_type, 0) + 1
    
    return {
        "badges": badge_list,
        "counts": badge_counts,
        "total": len(badge_list)
    }

@router.get("/stats")
async def get_badge_stats(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get badge statistics for the current user"""
    result = await db.execute(
        select(Badge).where(Badge.student_id == current_user.id)
    )
    badges = result.scalars().all()
    
    badge_counts = {}
    for badge in badges:
        badge_counts[badge.type] = badge_counts.get(badge.type, 0) + 1
    
    return {
        "total": len(badges),
        "counts": badge_counts
    }

@router.get("/{user_id}")
async def get_badges(
    user_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.id != user_id and current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.execute(
        select(Badge)
        .where(Badge.student_id == user_id)
        .order_by(Badge.earned_at.desc())
    )
    badges = result.scalars().all()
    
    badge_list = [{
        "id": b.id,
        "_id": b.id,
        "student_id": b.student_id,
        "type": b.type,
        "earned_at": b.earned_at,
        "assessment_id": b.assessment_id
    } for b in badges]
    
    badge_counts = {}
    for badge in badge_list:
        badge_type = badge["type"]
        badge_counts[badge_type] = badge_counts.get(badge_type, 0) + 1
    
    return {
        "badges": badge_list,
        "counts": badge_counts,
        "total": len(badge_list)
    }

@router.post("/award")
async def award_badge(
    student_id: str,
    badge_type: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can manually award badges")
    
    badges = await check_and_award_badges(student_id)
    
    return {
        "message": "Badges checked and awarded",
        "awarded": [badge["type"] for badge in badges]
    }
