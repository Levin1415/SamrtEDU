from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    MONGODB_URI: str = "mongodb://localhost:27017/smartacad"
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
