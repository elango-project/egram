import os
import logging
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-flash-latest"

# ── Validate at import time ──────────────────────────────
if not GEMINI_API_KEY or (not GEMINI_API_KEY.startswith("AIza") and not GEMINI_API_KEY.startswith("AQ.")):
    logger.error("❌ GEMINI_API_KEY is missing or has invalid format! All AI features will fail.")
else:
    logger.info("✅ GEMINI_API_KEY is configured (%d chars)", len(GEMINI_API_KEY))

client = genai.Client(api_key=GEMINI_API_KEY)


class GeminiError(Exception):
    """Custom exception for Gemini API errors."""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def generate_text(prompt: str, system_instruction: str = None) -> str:
    """Send a prompt to Gemini and return the text response."""
    try:
        config = None
        if system_instruction:
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
                max_output_tokens=4096,
            )

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=config,
        )
        if not response or not response.text:
            raise GeminiError("Received empty response from Gemini API.", status_code=500)
        return response.text
    except Exception as exc:
        error_msg = str(exc)
        logger.error("Gemini API error: %s", error_msg)

        # Detect rate limit errors
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            raise GeminiError(
                "Gemini API rate limit exceeded. Please wait a moment and try again.",
                status_code=429,
            )
        # Detect auth errors
        if "401" in error_msg or "403" in error_msg or "API_KEY_INVALID" in error_msg:
            raise GeminiError(
                "Gemini API key is invalid or unauthorized.",
                status_code=401,
            )
        # Generic error
        raise GeminiError(f"Gemini API error: {error_msg}", status_code=500)
