from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"
    grade: Optional[str] = None
    subject: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    grade: Optional[str] = None
    subject: Optional[str] = None
    language_pref: str = "English"
    avatar_url: Optional[str] = None
    created_at: datetime

class UserUpdate(BaseModel):
    name: Optional[str] = None
    grade: Optional[str] = None
    subject: Optional[str] = None
    language_pref: Optional[str] = None
    avatar_url: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
