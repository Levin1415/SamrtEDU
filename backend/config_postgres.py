"""
Updated Configuration for PostgreSQL
Replaces config.py
"""
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # API Keys
    OPENAI_API_KEY: str
    GEMINI_API_KEY: str
    
    # PostgreSQL Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/smartacad"
    
    # JWT Settings
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields like MONGODB_URI

settings = Settings()
