from database import badges_collection, submissions_collection, chat_history_collection, schedules_collection
from datetime import datetime, timedelta
from bson import ObjectId

async def check_and_award_badges(student_id: str, assessment_id: str = None, score: float = None):
    awarded_badges = []
    
    if score is not None and assessment_id:
        if score >= 90:
            badge = await award_badge(student_id, "Gold Academic", assessment_id)
            awarded_badges.append(badge)
        elif score >= 75:
            badge = await award_badge(student_id, "Silver Scholar", assessment_id)
            awarded_badges.append(badge)
        elif score >= 50:
            badge = await award_badge(student_id, "Bronze Learner", assessment_id)
            awarded_badges.append(badge)
    
    study_streak = await check_study_streak(student_id)
    if study_streak >= 7:
        existing = await badges_collection.find_one({
            "student_id": student_id,
            "type": "Study Streak"
        })
        if not existing:
            badge = await award_badge(student_id, "Study Streak")
            awarded_badges.append(badge)
    
    chat_count = await chat_history_collection.count_documents({"user_id": student_id})
    if chat_count >= 10:
        existing = await badges_collection.find_one({
            "student_id": student_id,
            "type": "AI Explorer"
        })
        if not existing:
            badge = await award_badge(student_id, "AI Explorer")
            awarded_badges.append(badge)
    
    submission_count = await submissions_collection.count_documents({"student_id": student_id})
    if submission_count >= 10:
        existing = await badges_collection.find_one({
            "student_id": student_id,
            "type": "Lesson Master"
        })
        if not existing:
            badge = await award_badge(student_id, "Lesson Master")
            awarded_badges.append(badge)
    
    schedule = await schedules_collection.find_one({"user_id": student_id})
    if schedule and len(schedule.get("blocks", [])) >= 5:
        days_scheduled = len(set(block["date"] for block in schedule["blocks"]))
        if days_scheduled >= 5:
            existing = await badges_collection.find_one({
                "student_id": student_id,
                "type": "Consistent Planner"
            })
            if not existing:
                badge = await award_badge(student_id, "Consistent Planner")
                awarded_badges.append(badge)
    
    return awarded_badges

async def award_badge(student_id: str, badge_type: str, assessment_id: str = None):
    badge = {
        "student_id": student_id,
        "type": badge_type,
        "earned_at": datetime.utcnow(),
        "assessment_id": assessment_id
    }
    result = await badges_collection.insert_one(badge)
    badge["_id"] = result.inserted_id
    return badge

async def check_study_streak(student_id: str) -> int:
    submissions = await submissions_collection.find(
        {"student_id": student_id}
    ).sort("submitted_at", -1).limit(30).to_list(30)
    
    if not submissions:
        return 0
    
    dates = sorted(set(sub["submitted_at"].date() for sub in submissions), reverse=True)
    
    streak = 1
    for i in range(len(dates) - 1):
        if (dates[i] - dates[i + 1]).days == 1:
            streak += 1
        else:
            break
    
    return streak

async def get_user_badges(student_id: str):
    badges = await badges_collection.find({"student_id": student_id}).sort("earned_at", -1).to_list(100)
    return badges
