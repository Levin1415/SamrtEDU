from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db
from routes import auth, users, ai, lessons, schedule, timetable, assessments, badges, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="SmartAcad API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(ai.router)
app.include_router(lessons.router)
app.include_router(schedule.router)
app.include_router(timetable.router)
app.include_router(assessments.router)
app.include_router(badges.router)
app.include_router(analytics.router)

@app.get("/")
async def root():
    return {"message": "SmartAcad API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
