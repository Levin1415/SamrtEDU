"""
PostgreSQL version of ai routes
Replace routes/ai.py with this file
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from models.chat import ChatRequest, ChatResponse, QuestionTypeRequest
from services.openai_service import transcribe_audio, detect_question_type
from services.gemini_service import chat_with_gemini
from database_postgres import get_db, ChatHistory
from middleware.auth_middleware_postgres import get_current_user
from datetime import datetime
import io

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        question_type = await detect_question_type(request.message)
        
        response_text = await chat_with_gemini(
            request.message,
            request.language,
            [msg.dict() for msg in request.history]
        )
        
        # Save user message
        user_message = ChatHistory(
            user_id=current_user.id,
            role="user",
            content=request.message,
            question_type=question_type,
            timestamp=datetime.utcnow()
        )
        
        # Save assistant message
        assistant_message = ChatHistory(
            user_id=current_user.id,
            role="assistant",
            content=response_text,
            question_type=None,
            timestamp=datetime.utcnow()
        )
        
        db.add(user_message)
        db.add(assistant_message)
        await db.commit()
        
        return ChatResponse(response=response_text, question_type=question_type)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...), current_user = Depends(get_current_user)):
    try:
        audio_bytes = await audio.read()
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = "audio.wav"
        
        transcript = await transcribe_audio(audio_file)
        
        return {"transcript": transcript}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-question-type")
async def detect_type(request: QuestionTypeRequest, current_user = Depends(get_current_user)):
    try:
        question_type = await detect_question_type(request.question)
        return {"question_type": question_type}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat-history")
async def get_chat_history(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ChatHistory)
        .where(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.timestamp.asc())
        .limit(100)
    )
    messages = result.scalars().all()
    
    message_list = [{
        "role": m.role,
        "content": m.content,
        "question_type": m.question_type,
        "timestamp": m.timestamp
    } for m in messages]
    
    return {
        "messages": message_list,
        "language": current_user.language_pref or "English"
    }

@router.delete("/chat-history")
async def clear_chat_history(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await db.execute(
        delete(ChatHistory).where(ChatHistory.user_id == current_user.id)
    )
    await db.commit()
    
    return {"message": "Chat history cleared"}
