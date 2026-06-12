import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.gemini_client import generate_text, GeminiError

logger = logging.getLogger(__name__)
router = APIRouter()


class MentorRequest(BaseModel):
    message: str
    context: str = ""  # e.g. "career guidance", "interview prep", "resume review"
    history: list[dict] = []


class MentorResponse(BaseModel):
    reply: str


@router.post("", response_model=MentorResponse)
def chat_with_mentor(req: MentorRequest):
    """
    Sarathi AI Mentor - answers career, interview, resume and technical questions.
    """
    system_instruction = (
        "You are Sarathi, an expert AI mentor for students on the Egram learning platform. "
        "You provide career guidance, interview preparation, resume feedback, "
        "and technical Q&A. Be encouraging, concise, and practical."
    )
    if req.context:
        system_instruction += f"\nCurrent context: {req.context}"

    # Build conversation from history
    conversation = ""
    for msg in req.history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "user":
            conversation += f"Student: {content}\n"
        else:
            conversation += f"Sarathi: {content}\n"

    full_prompt = f"{conversation}Student: {req.message}\nSarathi:"

    try:
        logger.info(f"Sending prompt to Gemini:\n{full_prompt}")
        reply = generate_text(full_prompt, system_instruction=system_instruction)
        logger.info(f"Received reply from Gemini:\n{reply}")
        return MentorResponse(reply=reply)
    except GeminiError as e:
        logger.error("Mentor chat error: %s", e.message)
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/mock-interview", response_model=MentorResponse)
def mock_interview(
    role: str,
    level: str = "junior",
    question_count: int = 5,
):
    """
    Generate mock interview questions for a given role.
    """
    system_instruction = (
        "You are an expert technical interviewer. Generate realistic interview questions "
        "that would be asked at top tech companies. Include a mix of conceptual, coding, "
        "and behavioral questions. Format each question as a numbered list with a brief hint."
    )
    prompt = (
        f"Generate {question_count} realistic technical interview questions "
        f"for a {level} {role} position. "
        "Include a mix of conceptual, coding, and behavioral questions. "
        "Format: numbered list with brief hints for each question."
    )

    try:
        reply = generate_text(prompt, system_instruction=system_instruction)
        return MentorResponse(reply=reply)
    except GeminiError as e:
        logger.error("Mock interview error: %s", e.message)
        raise HTTPException(status_code=e.status_code, detail=e.message)
