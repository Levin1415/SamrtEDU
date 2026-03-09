from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from models.chat import ChatRequest, ChatResponse, QuestionTypeRequest
from services.openai_service import transcribe_audio, detect_question_type
from services.gemini_service import chat_with_gemini
from database import chat_history_collection
from middleware.auth_middleware import get_current_user
from datetime import datetime
import io

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    try:
        question_type = await detect_question_type(request.message)
        
        response_text = await chat_with_gemini(
            request.message,
            request.language,
            [msg.dict() for msg in request.history]
        )
        
        user_message = {
            "role": "user",
            "content": request.message,
            "question_type": question_type,
            "timestamp": datetime.utcnow()
        }
        
        assistant_message = {
            "role": "assistant",
            "content": response_text,
            "question_type": None,
            "timestamp": datetime.utcnow()
        }
        
        chat_doc = await chat_history_collection.find_one({"user_id": str(current_user["_id"])})
        
        if chat_doc:
            await chat_history_collection.update_one(
                {"user_id": str(current_user["_id"])},
                {
                    "$push": {
                        "messages": {
                            "$each": [user_message, assistant_message],
                            "$slice": -100
                        }
                    },
                    "$set": {"language": request.language}
                }
            )
        else:
            await chat_history_collection.insert_one({
                "user_id": str(current_user["_id"]),
                "messages": [user_message, assistant_message],
                "language": request.language,
                "created_at": datetime.utcnow()
            })
        
        return ChatResponse(response=response_text, question_type=question_type)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        audio_bytes = await audio.read()
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = "audio.wav"
        
        transcript = await transcribe_audio(audio_file)
        
        return {"transcript": transcript}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-question-type")
async def detect_type(request: QuestionTypeRequest, current_user: dict = Depends(get_current_user)):
    try:
        question_type = await detect_question_type(request.question)
        return {"question_type": question_type}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat-history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    chat_doc = await chat_history_collection.find_one({"user_id": str(current_user["_id"])})
    
    if not chat_doc:
        return {"messages": [], "language": "English"}
    
    return {
        "messages": chat_doc.get("messages", []),
        "language": chat_doc.get("language", "English")
    }

@router.delete("/chat-history")
async def clear_chat_history(current_user: dict = Depends(get_current_user)):
    await chat_history_collection.delete_one({"user_id": str(current_user["_id"])})
    return {"message": "Chat history cleared"}
