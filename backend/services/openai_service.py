from openai import OpenAI
from config_postgres import settings
import json
import asyncio
from functools import partial

client = OpenAI(api_key=settings.OPENAI_API_KEY)

async def transcribe_audio(audio_file):
    try:
        loop = asyncio.get_event_loop()
        transcript = await loop.run_in_executor(None, lambda: client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        ))
        return transcript.text
    except Exception as e:
        raise Exception(f"Whisper transcription failed: {str(e)}")

async def detect_question_type(question: str) -> str:
    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, lambda: client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Classify this question into one of: Conceptual, Factual, Application, Creative, Procedural. Return only the label."},
                {"role": "user", "content": question}
            ],
            temperature=0.3,
            max_tokens=20
        ))
        return response.choices[0].message.content.strip()
    except Exception as e:
        return "Unknown"

async def generate_smart_schedule(subjects: list, goals: list, hours_per_day: int) -> dict:
    try:
        prompt = f"""Generate an optimized weekly study schedule.
Subjects: {', '.join(subjects)}
Goals: {', '.join(goals)}
Available hours per day: {hours_per_day}

Return a JSON array of study blocks with this structure:
[{{"subject": "Math", "topic": "Algebra", "day": "Monday", "start_time": "09:00", "end_time": "11:00", "priority": "High"}}]

Distribute subjects evenly, prioritize difficult subjects in morning hours, include breaks."""
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert academic scheduler. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
        
        return json.loads(content)
    except Exception as e:
        raise Exception(f"Schedule generation failed: {str(e)}")

async def generate_daily_plan(date: str, hours: int, tasks: list, energy: str, emergencies: str) -> dict:
    try:
        prompt = f"""Generate an energy-aware daily plan for {date}.
Available hours: {hours}
Pending tasks: {', '.join(tasks)}
Energy level: {energy}
Emergencies/Interruptions: {emergencies or 'None'}

Return a JSON object with this structure:
{{
  "plan": [
    {{"time": "09:00-10:00", "task": "Math homework", "energy_required": "High", "buffer": "15min"}},
  ],
  "summary": "Brief summary of the plan"
}}

Include flexible buffers for interruptions, schedule high-energy tasks when energy is high, include rest periods."""
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert daily planner. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
        
        return json.loads(content)
    except Exception as e:
        raise Exception(f"Daily plan generation failed: {str(e)}")

async def check_timetable_conflicts(slots: list) -> dict:
    try:
        prompt = f"""Check for conflicts in this timetable:
{json.dumps(slots, indent=2)}

Return a JSON object:
{{
  "has_conflicts": true/false,
  "conflicts": [
    {{"slot1": "Monday 09:00-10:00 Math", "slot2": "Monday 09:30-10:30 Physics", "issue": "Overlapping times"}},
  ],
  "suggestions": ["Move Physics to 10:30-11:30"]
}}"""
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a timetable conflict detector. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
        
        return json.loads(content)
    except Exception as e:
        raise Exception(f"Conflict check failed: {str(e)}")

async def generate_assessment(subject: str, topic: str, grade: str, num_questions: int, question_types: str) -> list:
    try:
        prompt = f"""Generate {num_questions} assessment questions.
Subject: {subject}
Topic: {topic}
Grade: {grade}
Question types: {question_types}

Return a JSON array:
[
  {{
    "question": "What is 2+2?",
    "type": "MCQ",
    "options": ["2", "3", "4", "5"],
    "correct_answer": "4"
  }},
  {{
    "question": "Explain photosynthesis.",
    "type": "Short Answer",
    "options": null,
    "correct_answer": "Process by which plants convert light energy into chemical energy..."
  }}
]

For MCQ: include 4 options. For True/False: options ["True", "False"]. For Short Answer: options null."""
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert assessment creator. Return only valid JSON array."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
        
        return json.loads(content)
    except Exception as e:
        raise Exception(f"Assessment generation failed: {str(e)}")
