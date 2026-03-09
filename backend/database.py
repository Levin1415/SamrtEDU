from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client = AsyncIOMotorClient(settings.MONGODB_URI)
db = client.smartacad

users_collection = db.users
chat_history_collection = db.chat_history
lesson_plans_collection = db.lesson_plans
schedules_collection = db.schedules
timetables_collection = db.timetables
assessments_collection = db.assessments
submissions_collection = db.submissions
badges_collection = db.badges

async def init_db():
    await users_collection.create_index("email", unique=True)
    await chat_history_collection.create_index("user_id")
    await lesson_plans_collection.create_index("teacher_id")
    await schedules_collection.create_index("user_id")
    await timetables_collection.create_index("user_id")
    await assessments_collection.create_index("teacher_id")
    await submissions_collection.create_index([("assessment_id", 1), ("student_id", 1)])
    await badges_collection.create_index("student_id")
