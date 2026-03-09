from fastapi import APIRouter, HTTPException, Depends
from models.timetable import AddSlotRequest, ConflictCheckRequest
from services.openai_service import check_timetable_conflicts
from database import timetables_collection
from middleware.auth_middleware import get_current_user
from bson import ObjectId
import uuid

router = APIRouter(prefix="/api/timetable", tags=["timetable"])

@router.get("/{user_id}")
async def get_timetable(user_id: str, current_user: dict = Depends(get_current_user)):
    if str(current_user["_id"]) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    timetable = await timetables_collection.find_one({"user_id": user_id})
    
    if not timetable:
        return {"slots": []}
    
    return {"slots": timetable.get("slots", [])}

@router.post("/add-slot")
async def add_slot(request: AddSlotRequest, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    slot = request.dict()
    slot["id"] = str(uuid.uuid4())
    
    timetable = await timetables_collection.find_one({"user_id": user_id})
    
    if timetable:
        await timetables_collection.update_one(
            {"user_id": user_id},
            {"$push": {"slots": slot}}
        )
    else:
        await timetables_collection.insert_one({
            "user_id": user_id,
            "slots": [slot]
        })
    
    return {"message": "Slot added successfully", "slot": slot}

@router.put("/slot/{slot_id}")
async def update_slot(slot_id: str, request: AddSlotRequest, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    timetable = await timetables_collection.find_one({"user_id": user_id})
    
    if not timetable:
        raise HTTPException(status_code=404, detail="Timetable not found")
    
    slots = timetable.get("slots", [])
    updated = False
    
    for i, slot in enumerate(slots):
        if slot.get("id") == slot_id:
            slots[i] = {**request.dict(), "id": slot_id}
            updated = True
            break
    
    if not updated:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    await timetables_collection.update_one(
        {"user_id": user_id},
        {"$set": {"slots": slots}}
    )
    
    return {"message": "Slot updated successfully"}

@router.delete("/slot/{slot_id}")
async def delete_slot(slot_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    
    result = await timetables_collection.update_one(
        {"user_id": user_id},
        {"$pull": {"slots": {"id": slot_id}}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    return {"message": "Slot deleted successfully"}

@router.post("/check-conflicts")
async def check_conflicts(request: ConflictCheckRequest, current_user: dict = Depends(get_current_user)):
    try:
        result = await check_timetable_conflicts([slot.dict() for slot in request.slots])
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
