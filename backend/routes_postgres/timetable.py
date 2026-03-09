"""
PostgreSQL version of timetable routes
Replace routes/timetable.py with this file
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from models.timetable import AddSlotRequest, ConflictCheckRequest
from services.openai_service import check_timetable_conflicts
from database_postgres import get_db, Timetable
from middleware.auth_middleware_postgres import get_current_user
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/timetable", tags=["timetable"])

@router.get("/{user_id}")
async def get_timetable(
    user_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.execute(
        select(Timetable).where(Timetable.user_id == user_id)
    )
    timetables = result.scalars().all()
    
    slots = [{
        "id": t.id,
        "day": t.day,
        "start_time": t.start_time,
        "end_time": t.end_time,
        "subject": t.subject,
        "room": t.room,
        "lecturer": t.lecturer
    } for t in timetables]
    
    return {"slots": slots}

@router.post("/add-slot")
async def add_slot(
    request: AddSlotRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id
    
    slot = Timetable(
        id=str(uuid.uuid4()),
        user_id=user_id,
        day=request.day,
        start_time=request.start_time,
        end_time=request.end_time,
        subject=request.subject,
        room=request.room,
        lecturer=request.lecturer,
        created_at=datetime.utcnow()
    )
    
    db.add(slot)
    await db.commit()
    await db.refresh(slot)
    
    return {
        "message": "Slot added successfully",
        "slot": {
            "id": slot.id,
            "day": slot.day,
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "subject": slot.subject,
            "room": slot.room,
            "lecturer": slot.lecturer
        }
    }

@router.put("/slot/{slot_id}")
async def update_slot(
    slot_id: str,
    request: AddSlotRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id
    
    result = await db.execute(
        select(Timetable).where(Timetable.id == slot_id, Timetable.user_id == user_id)
    )
    slot = result.scalar_one_or_none()
    
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    slot.day = request.day
    slot.start_time = request.start_time
    slot.end_time = request.end_time
    slot.subject = request.subject
    slot.room = request.room
    slot.lecturer = request.lecturer
    
    await db.commit()
    
    return {"message": "Slot updated successfully"}

@router.delete("/slot/{slot_id}")
async def delete_slot(
    slot_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id
    
    result = await db.execute(
        delete(Timetable).where(Timetable.id == slot_id, Timetable.user_id == user_id)
    )
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    await db.commit()
    
    return {"message": "Slot deleted successfully"}

@router.post("/check-conflicts")
async def check_conflicts(request: ConflictCheckRequest, current_user = Depends(get_current_user)):
    try:
        result = await check_timetable_conflicts([slot.dict() for slot in request.slots])
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
