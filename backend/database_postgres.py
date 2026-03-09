"""
PostgreSQL Database Configuration with SQLAlchemy
Replaces database.py (MongoDB version)
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, Float, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from config_postgres import settings
import uuid

# Create async engine
DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
# Remove any schema parameter from URL to avoid asyncpg compatibility issues
if "?" in DATABASE_URL:
    base_url, params = DATABASE_URL.split("?", 1)
    params_dict = dict(p.split("=") for p in params.split("&") if "=" in p)
    params_dict.pop("schema", None)
    if params_dict:
        DATABASE_URL = base_url + "?" + "&".join(f"{k}={v}" for k, v in params_dict.items())
    else:
        DATABASE_URL = base_url

engine = create_async_engine(
    DATABASE_URL, 
    echo=True, 
    future=True
)

# Session factory
AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

# ==================== MODELS ====================

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="student")  # student or teacher
    grade = Column(String, nullable=True)
    subject = Column(String, nullable=True)
    language_pref = Column(String, default="English")
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    chat_history = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    schedules = relationship("Schedule", back_populates="user", cascade="all, delete-orphan")
    timetables = relationship("Timetable", back_populates="user", cascade="all, delete-orphan")
    badges = relationship("Badge", back_populates="student", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="student", cascade="all, delete-orphan")
    
    # Teacher relationships
    lesson_plans = relationship("LessonPlan", foreign_keys="LessonPlan.teacher_id", back_populates="teacher")
    assessments = relationship("Assessment", foreign_keys="Assessment.teacher_id", back_populates="teacher")


class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String, nullable=False)  # user or assistant
    content = Column(Text, nullable=False)
    question_type = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    user = relationship("User", back_populates="chat_history")


class LessonPlan(Base):
    __tablename__ = "lesson_plans"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    teacher_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    grade = Column(String, nullable=False)
    type = Column(String, nullable=False)  # full or instant
    content = Column(Text, nullable=False)
    time_slots = Column(JSON, default=list)  # List of time slot objects
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    teacher = relationship("User", foreign_keys=[teacher_id], back_populates="lesson_plans")


class Schedule(Base):
    __tablename__ = "schedules"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    date = Column(String, nullable=False, index=True)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    priority = Column(String, default="Medium")
    color = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="schedules")
    
    __table_args__ = (
        Index('idx_user_date', 'user_id', 'date'),
    )


class Timetable(Base):
    __tablename__ = "timetables"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    day = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    room = Column(String, nullable=True)
    lecturer = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="timetables")
    
    __table_args__ = (
        Index('idx_user_day', 'user_id', 'day'),
    )


class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    teacher_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    grade = Column(String, nullable=False)
    questions = Column(JSON, nullable=False)  # List of question objects
    assigned_to = Column(JSON, default=list)  # List of student IDs
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    teacher = relationship("User", foreign_keys=[teacher_id], back_populates="assessments")
    submissions = relationship("Submission", back_populates="assessment", cascade="all, delete-orphan")


class Submission(Base):
    __tablename__ = "submissions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    answers = Column(JSON, nullable=False)  # List of answers
    score = Column(Float, nullable=False)
    feedback = Column(JSON, default=list)  # List of feedback objects
    badge_earned = Column(String, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    assessment = relationship("Assessment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")
    
    __table_args__ = (
        Index('idx_assessment_student', 'assessment_id', 'student_id', unique=True),
    )


class Badge(Base):
    __tablename__ = "badges"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String, nullable=False)  # bronze, silver, gold, streak, etc.
    earned_at = Column(DateTime, default=datetime.utcnow, index=True)
    assessment_id = Column(String, nullable=True)
    
    student = relationship("User", back_populates="badges")


# ==================== DATABASE FUNCTIONS ====================

async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ PostgreSQL database initialized successfully!")


async def get_db():
    """Dependency for getting database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# ==================== HELPER FUNCTIONS ====================

def model_to_dict(model):
    """Convert SQLAlchemy model to dictionary (mimics MongoDB document)"""
    if model is None:
        return None
    
    result = {}
    for column in model.__table__.columns:
        value = getattr(model, column.name)
        if isinstance(value, datetime):
            result[column.name] = value
        else:
            result[column.name] = value
    
    # Rename id to match MongoDB's _id pattern if needed
    if 'id' in result:
        result['_id'] = result['id']
    
    return result


def models_to_list(models):
    """Convert list of SQLAlchemy models to list of dicts"""
    return [model_to_dict(model) for model in models]
