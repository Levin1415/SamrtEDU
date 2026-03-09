from fastapi import APIRouter, HTTPException, Depends
from models.schedule import AddBlockRequest, AIScheduleRequest, DailyPlanRequest
from services.openai_service import generate_smart_schedule, generate_daily_plan
from database import schedules_collection
from middleware.auth_middleware import get_current_user
from bson import ObjectId
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/schedule", tags=["schedule"])

@router.post("/ai-optimize")
async def ai_optimize(request: AIScheduleRequest, current_user: dict = Depends(get_current_user)):
    try:
        blocks = await generate_smart_schedule(
            request.subjects,
            request.goals,
            request.available_hours_per_day
        )
        
        for block in blocks:
            block["id"] = str(uuid.uuid4())
            block["color"] = None
        
        return {"blocks": blocks, "success": True}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/daily-plan")
async def daily_plan(request: DailyPlanRequest, current_user: dict = Depends(get_current_user)):
    try:
        plan = await generate_daily_plan(
            request.date,
            request.available_hours,
            request.pending_tasks,
            request.energy_level,
            request.emergencies
        )
        
        return plan
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}")
async def get_schedule(user_id: str, current_user: dict = Depends(get_current_user)):
    if str(current_user["_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    schedule = await schedules_collection.find_one({"user_id": user_id})
    
    if not schedule:
        return {"blocks": []}
    
    return {"blocks": schedule.get("blocks", [])}

@router.post("/add-block")
async def add_block(request: AddBlockRequest, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    block = request.dict()
    block["id"] = str(uuid.uuid4())
    block["color"] = None
    
    schedule = await schedules_collection.find_one({"user_id": user_id})
    
    if schedule:
        await schedules_collection.update_one(
            {"user_id": user_id},
            {"$push": {"blocks": block}}
        )
    else:
        await schedules_collection.insert_one({
            "user_id": user_id,
            "blocks": [block]
        })
    
    return {"message": "Block added successfully", "block": block}

@router.put("/update-block/{block_id}")
async def update_block(block_id: str, request: AddBlockRequest, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    schedule = await schedules_collection.find_one({"user_id": user_id})
    
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    blocks = schedule.get("blocks", [])
    updated = False
    
    for i, block in enumerate(blocks):
        if block.get("id") == block_id:
            blocks[i] = {**request.dict(), "id": block_id, "color": block.get("color")}
            updated = True
            break
    
    if not updated:
        raise HTTPException(status_code=404, detail="Block not found")
    
    await schedules_collection.update_one(
        {"user_id": user_id},
        {"$set": {"blocks": blocks}}
    )
    
    return {"message": "Block updated successfully"}

@router.delete("/block/{block_id}")
async def delete_block(block_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    result = await schedules_collection.update_one(
        {"user_id": user_id},
        {"$pull": {"blocks": {"id": block_id}}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Block not found")
    
    return {"message": "Block deleted successfully"}
