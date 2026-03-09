"""
PostgreSQL version of schedule routes
Replace routes/schedule.py with this file
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from models.schedule import AddBlockRequest, AIScheduleRequest, DailyPlanRequest
from services.openai_service import generate_smart_schedule, generate_daily_plan
from database_postgres import get_db, Schedule
from middleware.auth_middleware_postgres import get_current_user
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/schedule", tags=["schedule"])

@router.post("/ai-optimize")
async def ai_optimize(request: AIScheduleRequest, current_user = Depends(get_current_user)):
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
async def daily_plan(request: DailyPlanRequest, current_user = Depends(get_current_user)):
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
async def get_schedule(
    user_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.execute(
        select(Schedule).where(Schedule.user_id == user_id)
    )
    schedules = result.scalars().all()
    
    blocks = [{
        "id": s.id,
        "subject": s.subject,
        "topic": s.topic,
        "date": s.date,
        "start_time": s.start_time,
        "end_time": s.end_time,
        "priority": s.priority,
        "color": s.color
    } for s in schedules]
    
    return {"blocks": blocks}

@router.post("/add-block")
async def add_block(
    request: AddBlockRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id
    
    block = Schedule(
        id=str(uuid.uuid4()),
        user_id=user_id,
        subject=request.subject,
        topic=request.topic,
        date=request.date,
        start_time=request.start_time,
        end_time=request.end_time,
        priority=request.priority,
        color=None,
        created_at=datetime.utcnow()
    )
    
    db.add(block)
    await db.commit()
    await db.refresh(block)
    
    return {
        "message": "Block added successfully",
        "block": {
            "id": block.id,
            "subject": block.subject,
            "topic": block.topic,
            "date": block.date,
            "start_time": block.start_time,
            "end_time": block.end_time,
            "priority": block.priority,
            "color": block.color
        }
    }

@router.put("/update-block/{block_id}")
async def update_block(
    block_id: str,
    request: AddBlockRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id
    
    result = await db.execute(
        select(Schedule).where(Schedule.id == block_id, Schedule.user_id == user_id)
    )
    block = result.scalar_one_or_none()
    
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    
    block.subject = request.subject
    block.topic = request.topic
    block.date = request.date
    block.start_time = request.start_time
    block.end_time = request.end_time
    block.priority = request.priority
    
    await db.commit()
    
    return {"message": "Block updated successfully"}

@router.delete("/block/{block_id}")
async def delete_block(
    block_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id
    
    result = await db.execute(
        delete(Schedule).where(Schedule.id == block_id, Schedule.user_id == user_id)
    )
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Block not found")
    
    await db.commit()
    
    return {"message": "Block deleted successfully"}
