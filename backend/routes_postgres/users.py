"""
PostgreSQL version of users routes
Replace routes/users.py with this file
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import UserUpdate, UserResponse
from database_postgres import get_db, User
from middleware.auth_middleware_postgres import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])

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

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user_to_response(user)

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    update_data: UserUpdate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user")
    
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    
    for key, value in update_dict.items():
        setattr(user, key, value)
    
    await db.commit()
    await db.refresh(user)
    
    return user_to_response(user)

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user")
    
    result = await db.execute(
        delete(User).where(User.id == user_id)
    )
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.commit()
    
    return {"message": "User deleted successfully"}
