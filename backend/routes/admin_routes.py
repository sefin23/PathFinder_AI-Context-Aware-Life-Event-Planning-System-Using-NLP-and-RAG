"""
Simple admin endpoints for checking LLM provider health.

Endpoints:
  GET /admin/llm_health

The endpoint tries a lightweight completion with OpenRouter (if configured)
and Gemini (if configured) and returns status details for each provider.
"""
from fastapi import APIRouter
import logging

from backend.config import settings
from backend.services import openrouter_client
from backend.services import rag_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/llm_health")
def llm_health():
    results = {}

    # OpenRouter check
    if settings.openrouter_api_key:
        try:
            txt = openrouter_client.generate_completion(
                model=settings.openrouter_model,
                system_instruction="Health check: reply with OK",
                user_message="Please reply with the single word OK.",
                max_tokens=8,
                temperature=0.0,
            )
            ok = txt.strip().upper().startswith("OK")
            results["openrouter"] = {"available": True, "ok": ok, "message": txt}
        except Exception as exc:
            logger.exception("OpenRouter health check failed")
            results["openrouter"] = {"available": True, "ok": False, "message": str(exc)}
    else:
        results["openrouter"] = {"available": False, "ok": False, "message": "OPENROUTER_API_KEY not set"}

    # Gemini check
    if settings.gemini_api_key:
        try:
            client = rag_service._get_gemini_client()
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents="Health check: reply OK",
                config=rag_service.types.GenerateContentConfig(
                    system_instruction="Health check: reply with OK",
                    temperature=0.0,
                    max_output_tokens=8,
                ),
            )
            text = response.text.strip()
            ok = text.upper().startswith("OK")
            results["gemini"] = {"available": True, "ok": ok, "message": text}
        except Exception as exc:
            logger.exception("Gemini health check failed")
            results["gemini"] = {"available": True, "ok": False, "message": str(exc)}
    else:
        results["gemini"] = {"available": False, "ok": False, "message": "GEMINI_API_KEY not set"}

    return results
