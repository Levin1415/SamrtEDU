import google.generativeai as genai
from config_postgres import settings
import json

genai.configure(api_key=settings.GEMINI_API_KEY)

async def chat_with_gemini(message: str, language: str, history: list) -> str:
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        system_prompt = f"""You are an intelligent academic tutor. Respond in {language}. 
If the question is in a different language, detect it and respond in {language}.
Provide clear, educational responses with examples when helpful.
Format your responses with proper structure and markdown when appropriate."""
        
        chat_history = []
        for msg in history[-10:]:
            role = "user" if msg["role"] == "user" else "model"
            chat_history.append({"role": role, "parts": [msg["content"]]})
        
        chat = model.start_chat(history=chat_history)
        response = chat.send_message(f"{system_prompt}\n\nUser question: {message}")
        
        return response.text
    except Exception as e:
        raise Exception(f"Gemini chat failed: {str(e)}")

async def generate_full_lesson_plan(subject: str, grade: str, topic: str, duration_weeks: int, objectives: list, style: str) -> dict:
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        prompt = f"""Generate a complete {duration_weeks}-week lesson plan.
Subject: {subject}
Grade: {grade}
Topic: {topic}
Learning Objectives: {', '.join(objectives)}
Teaching Style: {style}

Return a JSON object:
{{
  "overview": "Brief overview of the lesson plan",
  "weeks": [
    {{
      "week": 1,
      "theme": "Introduction to {topic}",
      "days": [
        {{
          "day": "Monday",
          "slots": [
            {{
              "duration": "45 minutes",
              "activity": "Introduction lecture",
              "objectives": ["Understand basic concepts"],
              "resources": ["Textbook Chapter 1", "Slides"],
              "assessment": "Quick quiz"
            }}
          ]
        }}
      ]
    }}
  ]
}}

Include detailed activities, resources, and assessments for each slot."""
        
        response = model.generate_content(prompt)
        content = response.text.strip()
        
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
        
        return json.loads(content)
    except Exception as e:
        raise Exception(f"Full lesson plan generation failed: {str(e)}")

async def generate_instant_lesson(prompt: str) -> dict:
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        system_prompt = f"""Generate a structured single-lesson plan based on: "{prompt}"

Return a JSON object:
{{
  "title": "Lesson title",
  "duration": "50 minutes",
  "objectives": ["Objective 1", "Objective 2"],
  "introduction": {{
    "duration": "5 minutes",
    "activity": "Hook activity description"
  }},
  "main_activity": {{
    "duration": "30 minutes",
    "activity": "Main teaching activity"
  }},
  "assessment": {{
    "duration": "10 minutes",
    "activity": "Assessment method"
  }},
  "wrap_up": {{
    "duration": "5 minutes",
    "activity": "Conclusion activity"
  }},
  "resources": ["Resource 1", "Resource 2"]
}}"""
        
        response = model.generate_content(system_prompt)
        content = response.text.strip()
        
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
        
        return json.loads(content)
    except Exception as e:
        raise Exception(f"Instant lesson generation failed: {str(e)}")

async def grade_assessment(questions: list, answers: list) -> dict:
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        qa_pairs = []
        for i, (q, a) in enumerate(zip(questions, answers)):
            qa_pairs.append({
                "question_num": i + 1,
                "question": q["question"],
                "type": q["type"],
                "correct_answer": q["correct_answer"],
                "student_answer": a,
                "options": q.get("options")
            })
        
        prompt = f"""Grade this assessment and provide detailed feedback.

Questions and Answers:
{json.dumps(qa_pairs, indent=2)}

Return a JSON object:
{{
  "results": [
    {{
      "question_num": 1,
      "is_correct": true,
      "score": 1,
      "feedback": "Excellent! Your answer is correct.",
      "correct_answer": "4"
    }}
  ],
  "total_score": 8,
  "max_score": 10,
  "percentage": 80,
  "overall_feedback": "Good work! Focus on..."
}}

For MCQ and True/False: exact match required.
For Short Answer: grade based on key concepts, partial credit allowed."""
        
        response = model.generate_content(prompt)
        content = response.text.strip()
        
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
        
        return json.loads(content)
    except Exception as e:
        raise Exception(f"Assessment grading failed: {str(e)}")
