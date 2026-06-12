import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("egram-ai")

from app.routers import mentor, video, resume


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks."""
    # ── Startup ──
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        logger.error("❌  GEMINI_API_KEY not found in environment — AI features will fail!")
    else:
        logger.info("✅  GEMINI_API_KEY loaded (%d chars)", len(api_key))

    # Quick validation: try a minimal Gemini call
    try:
        from app.gemini_client import generate_text
        test_response = generate_text("Reply with exactly: GEMINI_OK")
        if test_response:
            logger.info("✅  Gemini API connection verified — model responded successfully")
        else:
            logger.warning("⚠️  Gemini API returned empty response")
    except Exception as exc:
        logger.error("❌  Gemini API connection FAILED: %s", exc)

    logger.info("🚀  Egram AI Service is ready on port %s", os.getenv("PORT", "8001"))
    yield
    # ── Shutdown ──
    logger.info("👋  Egram AI Service shutting down")


app = FastAPI(
    title="Egram AI Service",
    description="Python FastAPI microservice powering Sarathi AI Mentor, Video Summary/Q&A, and Resume Builder",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mentor.router, prefix="/ai/mentor", tags=["Sarathi AI Mentor"])
app.include_router(video.router, prefix="/ai/video", tags=["AI Video Assistant"])
app.include_router(resume.router, prefix="/ai/resume", tags=["AI Resume Builder"])


@app.get("/health", tags=["Health"])
def health():
    api_key = os.getenv("GEMINI_API_KEY", "")
    return {
        "status": "ok",
        "service": "egram-ai",
        "gemini_configured": bool(api_key),
    }
