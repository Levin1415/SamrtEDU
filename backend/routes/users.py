from fastapi import APIRouter, HTTPException, Depends
from models.user import UserUpdate, UserResponse
from database import users_collection
from middleware.auth_middleware import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/api/users", tags=["users"])

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

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_to_response(user)

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    if str(current_user["_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user")
    
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    
    if update_dict:
        await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_dict}
        )
    
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    return user_to_response(user)

@router.delete("/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if str(current_user["_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user")
    
    result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}
