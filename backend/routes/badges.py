from fastapi import APIRouter, HTTPException, Depends
from services.badge_service import get_user_badges, check_and_award_badges
from middleware.auth_middleware import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/api/badges", tags=["badges"])

@router.get("/{user_id}")
async def get_badges(user_id: str, current_user: dict = Depends(get_current_user)):
    if str(current_user["_id"]) != user_id and current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    badges = await get_user_badges(user_id)
    
    for badge in badges:
        badge["id"] = str(badge.pop("_id"))
    
    badge_counts = {}
    for badge in badges:
        badge_type = badge["type"]
        badge_counts[badge_type] = badge_counts.get(badge_type, 0) + 1
    
    return {
        "badges": badges,
        "counts": badge_counts,
        "total": len(badges)
    }

@router.post("/award")
async def award_badge(student_id: str, badge_type: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can manually award badges")
    
    badges = await check_and_award_badges(student_id)
    
    return {
        "message": "Badges checked and awarded",
        "awarded": [badge["type"] for badge in badges]
    }
