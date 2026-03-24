"""
CLI helper to run LLM health checks locally without starting the web server.

Usage:
  python -m backend.scripts.check_llm_health

This script will call the OpenRouter and Gemini checks directly and print results.
"""
from backend.config import settings
from backend.services import openrouter_client
from backend.services import rag_service
import sys


def main():
    print("LLM health check")
    print("=================")

    # OpenRouter
    if settings.openrouter_api_key:
        try:
            txt = openrouter_client.generate_completion(
                model=settings.openrouter_model,
                system_instruction="Health check: reply with OK",
                user_message="Please reply with the single word OK.",
                max_tokens=8,
                temperature=0.0,
            )
            print(f"OpenRouter: OK? -> {txt.strip()}\n")
        except Exception as exc:
            print(f"OpenRouter error: {exc}\n")
    else:
        print("OpenRouter: SKIPPED (OPENROUTER_API_KEY not set)\n")

    # Gemini
    if settings.gemini_api_key:
        try:
            client = rag_service._get_gemini_client()
            resp = client.models.generate_content(
                model="gemini-2.0-flash",
                contents="Health check: reply OK",
                config=rag_service.types.GenerateContentConfig(
                    system_instruction="Health check: reply with OK",
                    temperature=0.0,
                    max_output_tokens=8,
                ),
            )
            print(f"Gemini: OK? -> {resp.text.strip()}\n")
        except Exception as exc:
            print(f"Gemini error: {exc}\n")
    else:
        print("Gemini: SKIPPED (GEMINI_API_KEY not set)\n")


if __name__ == "__main__":
    main()
