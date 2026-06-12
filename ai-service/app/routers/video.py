import json
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.gemini_client import generate_text, GeminiError

logger = logging.getLogger(__name__)
router = APIRouter()


class VideoSummaryRequest(BaseModel):
    video_title: str
    video_description: str = ""
    transcript: str = ""


class QnARequest(BaseModel):
    video_title: str
    transcript: str = ""
    question: str


class VideoSummaryResponse(BaseModel):
    summary: str
    key_takeaways: list[str]
    important_concepts: list[str]


class QnAResponse(BaseModel):
    answer: str


@router.post("/summary", response_model=VideoSummaryResponse)
def summarize_video(req: VideoSummaryRequest):
    """
    Generate a summary, key takeaways, and important concepts for a video.
    """
    context = req.transcript if req.transcript else req.video_description
    system_instruction = (
        "You are an educational AI assistant that analyzes video content. "
        "Always respond in valid JSON format with no extra text."
    )
    prompt = f"""Analyze this video content and provide:
1. A concise summary (2-3 sentences)
2. Exactly 5 key takeaways as a bullet list
3. Exactly 5 important concepts mentioned

Video Title: {req.video_title}
Content: {context}

Respond in this exact JSON format (no markdown, no code fences):
{{
  "summary": "...",
  "key_takeaways": ["...", "...", "...", "...", "..."],
  "important_concepts": ["...", "...", "...", "...", "..."]
}}"""

    try:
        raw = generate_text(prompt, system_instruction=system_instruction)
        # Strip markdown code fences if present
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            # Remove opening fence (```json or ```)
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            data = json.loads(cleaned)
            return VideoSummaryResponse(
                summary=data.get("summary", ""),
                key_takeaways=data.get("key_takeaways", []),
                important_concepts=data.get("important_concepts", []),
            )
        except json.JSONDecodeError:
            logger.warning("Gemini returned non-JSON response, using raw text as summary")
            return VideoSummaryResponse(summary=raw, key_takeaways=[], important_concepts=[])

    except GeminiError as e:
        logger.error("Video summary error: %s", e.message)
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/qna", response_model=QnAResponse)
def video_qna(req: QnARequest):
    """
    Answer a student's question based on the video context.
    """
    context = req.transcript if req.transcript else f"Video titled: {req.video_title}"
    system_instruction = (
        "You are an AI teaching assistant. Answer questions clearly and concisely "
        "based on the provided video content."
    )
    prompt = (
        f"Based on this video content:\n\n{context}\n\n"
        f"Answer this student's question clearly and concisely:\n"
        f"Question: {req.question}\nAnswer:"
    )

    try:
        answer = generate_text(prompt, system_instruction=system_instruction)
        return QnAResponse(answer=answer)
    except GeminiError as e:
        logger.error("Video Q&A error: %s", e.message)
        raise HTTPException(status_code=e.status_code, detail=e.message)
