"""
Updated FastAPI Main Application for PostgreSQL
Replaces main.py
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database_postgres import init_db
from routes_postgres import auth, users, ai, lessons, schedule, timetable, assessments, badges, analytics

# region agent log
import json as _json
import time as _time
from pathlib import Path as _Path

_DEBUG_LOG_PATHS = [
    _Path(r"c:\Users\panda\Desktop\Kiro\.cursor\debug-d379c9.log"),
    _Path(r"c:\Users\panda\Desktop\Kiro\debug-d379c9.log"),
]

def _alog(hypothesis_id: str, location: str, message: str, data: dict):
    try:
        payload = {
            "sessionId": "d379c9",
            "runId": "pre-fix",
            "hypothesisId": hypothesis_id,
            "location": location,
            "message": message,
            "data": data,
            "timestamp": int(_time.time() * 1000),
        }
        line = _json.dumps(payload, ensure_ascii=False) + "\n"
        for p in _DEBUG_LOG_PATHS:
            try:
                p.parent.mkdir(parents=True, exist_ok=True)
                with open(p, "a", encoding="utf-8") as f:
                    f.write(line)
            except Exception:
                pass
    except Exception:
        pass

_alog("H0", "backend/main_postgres.py:import", "main_postgres loaded", {"logPaths": [str(p) for p in _DEBUG_LOG_PATHS]})
# endregion agent log

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize PostgreSQL database
    await init_db()
    yield
    # Cleanup if needed

app = FastAPI(
    title="SmartAcad API (PostgreSQL)", 
    version="2.0.0",
    description="Educational platform API with PostgreSQL backend",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174", 
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
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
    return {
        "message": "SmartAcad API is running",
        "database": "PostgreSQL",
        "version": "2.0.0"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "database": "PostgreSQL"
    }
