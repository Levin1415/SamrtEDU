"""
PostgreSQL version of auth routes
Replace routes/auth.py with this file
"""
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import UserCreate, UserLogin, Token, UserResponse
from database_postgres import get_db, User
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from jose import jwt
from datetime import datetime, timedelta
from config_postgres import settings
from middleware.auth_middleware_postgres import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])
pwd_hasher = PasswordHasher()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        grade=user.grade,
        subject=user.subject,
        language_pref=user.language_pref,
        avatar_url=user.avatar_url,
        created_at=user.created_at
    )

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = pwd_hasher.hash(user_data.password)
    
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password,
        role=user_data.role,
        grade=user_data.grade,
        subject=user_data.subject,
        language_pref="English",
        created_at=datetime.utcnow()
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Create access token
    access_token = create_access_token({"sub": new_user.id})
    
    return Token(
        access_token=access_token,
        user=user_to_response(new_user)
    )

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    # Find user
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    try:
        pwd_hasher.verify(user.password_hash, credentials.password)
    except VerifyMismatchError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token({"sub": user.id})
    
    return Token(
        access_token=access_token,
        user=user_to_response(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return user_to_response(current_user)

@router.post("/refresh", response_model=Token)
async def refresh_token(current_user: User = Depends(get_current_user)):
    access_token = create_access_token({"sub": current_user.id})
    return Token(
        access_token=access_token,
        user=user_to_response(current_user)
    )
