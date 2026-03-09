
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy.ext.asyncio import AsyncSession
from database_postgres import AsyncSessionLocal, User, ChatHistory, LessonPlan, Schedule, Timetable, Assessment, Submission, Badge
from config import settings
from datetime import datetime

# MongoDB connection
mongo_client = AsyncIOMotorClient(settings.MONGODB_URL)
mongo_db = mongo_client[settings.DATABASE_NAME]

async def migrate_users():
    print("Migrating users...")
    
    async with AsyncSessionLocal() as db:
        users_collection = mongo_db.users
        users = await users_collection.find().to_list(None)
        
        for user in users:
            pg_user = User(
                id=str(user["_id"]),
                name=user["name"],
                email=user["email"],
                password_hash=user["password"],
                role=user.get("role", "student"),
                grade=user.get("grade"),
                subject=user.get("subject"),
                language_pref=user.get("language_pref", "English"),
                avatar_url=user.get("avatar_url"),
                created_at=user.get("created_at", datetime.utcnow())
            )
            db.add(pg_user)
        
        await db.commit()
        print(f"✅ Migrated {len(users)} users")

async def migrate_chat_history():
    print("Migrating chat history...")
    
    async with AsyncSessionLocal() as db:
        chat_collection = mongo_db.chat_history
        chats = await chat_collection.find().to_list(None)
        
        count = 0
        for chat in chats:
            user_id = str(chat["user_id"])
            messages = chat.get("messages", [])
            
            for msg in messages:
                pg_chat = ChatHistory(
                    user_id=user_id,
                    role=msg["role"],
                    content=msg["content"],
                    question_type=msg.get("question_type"),
                    timestamp=msg.get("timestamp", datetime.utcnow())
                )
                db.add(pg_chat)
                count += 1
        
        await db.commit()
        print(f"✅ Migrated {count} chat messages")

async def migrate_lesson_plans():
    print("Migrating lesson plans...")
    
    async with AsyncSessionLocal() as db:
        lessons_collection = mongo_db.lesson_plans
        lessons = await lessons_collection.find().to_list(None)
        
        for lesson in lessons:
            pg_lesson = LessonPlan(
                id=str(lesson["_id"]),
                teacher_id=lesson["teacher_id"],
                subject=lesson["subject"],
                topic=lesson["topic"],
                grade=lesson["grade"],
                type=lesson["type"],
                content=lesson["content"],
                time_slots=lesson.get("time_slots", []),
                created_at=lesson.get("created_at", datetime.utcnow())
            )
            db.add(pg_lesson)
        
        await db.commit()
        print(f"✅ Migrated {len(lessons)} lesson plans")

async def migrate_schedules():
    print("Migrating schedules...")
    
    async with AsyncSessionLocal() as db:
        schedules_collection = mongo_db.schedules
        schedules = await schedules_collection.find().to_list(None)
        
        count = 0
        for schedule in schedules:
            user_id = schedule["user_id"]
            blocks = schedule.get("blocks", [])
            
            for block in blocks:
                pg_schedule = Schedule(
                    id=block.get("id", str(datetime.utcnow().timestamp())),
                    user_id=user_id,
                    subject=block["subject"],
                    topic=block.get("topic", ""),
                    date=block["date"],
                    start_time=block["start_time"],
                    end_time=block["end_time"],
                    priority=block.get("priority", "Medium"),
                    color=block.get("color"),
                    created_at=datetime.utcnow()
                )
                db.add(pg_schedule)
                count += 1
        
        await db.commit()
        print(f"✅ Migrated {count} schedule blocks")

async def migrate_timetables():
    print("Migrating timetables...")
    
    async with AsyncSessionLocal() as db:
        timetables_collection = mongo_db.timetables
        timetables = await timetables_collection.find().to_list(None)
        
        count = 0
        for timetable in timetables:
            user_id = timetable["user_id"]
            slots = timetable.get("slots", [])
            
            for slot in slots:
                pg_timetable = Timetable(
                    id=slot.get("id", str(datetime.utcnow().timestamp())),
                    user_id=user_id,
                    day=slot["day"],
                    start_time=slot["start_time"],
                    end_time=slot["end_time"],
                    subject=slot["subject"],
                    room=slot.get("room"),
                    lecturer=slot.get("lecturer"),
                    created_at=datetime.utcnow()
                )
                db.add(pg_timetable)
                count += 1
        
        await db.commit()
        print(f"✅ Migrated {count} timetable slots")

async def migrate_assessments():
    print("Migrating assessments...")
    
    async with AsyncSessionLocal() as db:
        assessments_collection = mongo_db.assessments
        assessments = await assessments_collection.find().to_list(None)
        
        for assessment in assessments:
            pg_assessment = Assessment(
                id=str(assessment["_id"]),
                teacher_id=assessment["teacher_id"],
                subject=assessment["subject"],
                topic=assessment["topic"],
                grade=assessment["grade"],
                questions=assessment["questions"],
                assigned_to=assessment.get("assigned_to", []),
                created_at=assessment.get("created_at", datetime.utcnow())
            )
            db.add(pg_assessment)
        
        await db.commit()
        print(f"✅ Migrated {len(assessments)} assessments")

async def migrate_submissions():
    print("Migrating submissions...")
    
    async with AsyncSessionLocal() as db:
        submissions_collection = mongo_db.submissions
        submissions = await submissions_collection.find().to_list(None)
        
        for submission in submissions:
            pg_submission = Submission(
                id=str(submission["_id"]),
                assessment_id=submission["assessment_id"],
                student_id=submission["student_id"],
                answers=submission["answers"],
                score=submission["score"],
                feedback=submission.get("feedback", []),
                badge_earned=submission.get("badge_earned"),
                submitted_at=submission.get("submitted_at", datetime.utcnow())
            )
            db.add(pg_submission)
        
        await db.commit()
        print(f"✅ Migrated {len(submissions)} submissions")

async def migrate_badges():
    print("Migrating badges...")
    
    async with AsyncSessionLocal() as db:
        badges_collection = mongo_db.badges
        badges = await badges_collection.find().to_list(None)
        
        for badge in badges:
            pg_badge = Badge(
                id=str(badge["_id"]),
                student_id=badge["student_id"],
                type=badge["type"],
                earned_at=badge.get("earned_at", datetime.utcnow()),
                assessment_id=badge.get("assessment_id")
            )
            db.add(pg_badge)
        
        await db.commit()
        print(f"✅ Migrated {len(badges)} badges")

async def main():
    """Run all migrations"""
    print("=" * 60)
    print("Starting MongoDB to PostgreSQL Migration")
    print("=" * 60)
    
    try:
        await migrate_users()
        await migrate_chat_history()
        await migrate_lesson_plans()
        await migrate_schedules()
        await migrate_timetables()
        await migrate_assessments()
        await migrate_submissions()
        await migrate_badges()
        
        print("\n" + "=" * 60)
        print("✅ Migration completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        mongo_client.close()

if __name__ == "__main__":
    asyncio.run(main())
