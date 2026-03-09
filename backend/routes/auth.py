from fastapi import APIRouter, HTTPException, status, Depends
from models.user import UserCreate, UserLogin, Token, UserResponse
from database import users_collection
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from config import settings
from bson import ObjectId
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def user_to_response(user: dict) -> UserResponse:
    return UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        role=user["role"],
        grade=user.get("grade"),
        subject=user.get("subject"),
        language_pref=user.get("language_pref", "English"),
        avatar_url=user.get("avatar_url"),
        created_at=user["created_at"]
    )

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    existing = await users_collection.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = pwd_context.hash(user_data.password)
    
    user = {
        "name": user_data.name,
        "email": user_data.email,
        "password_hash": hashed_password,
        "role": user_data.role,
        "grade": user_data.grade,
        "subject": user_data.subject,
        "language_pref": "English",
        "avatar_url": None,
        "created_at": datetime.utcnow()
    }
    
    result = await users_collection.insert_one(user)
    user["_id"] = result.inserted_id
    
    access_token = create_access_token({"sub": str(user["_id"])})
    
    return Token(
        access_token=access_token,
        user=user_to_response(user)
    )

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await users_collection.find_one({"email": credentials.email})
    
    if not user or not pwd_context.verify(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token({"sub": str(user["_id"])})
    
    return Token(
        access_token=access_token,
        user=user_to_response(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return user_to_response(current_user)

@router.post("/refresh", response_model=Token)
async def refresh_token(current_user: dict = Depends(get_current_user)):
    access_token = create_access_token({"sub": str(current_user["_id"])})
    return Token(
        access_token=access_token,
        user=user_to_response(current_user)
    )
