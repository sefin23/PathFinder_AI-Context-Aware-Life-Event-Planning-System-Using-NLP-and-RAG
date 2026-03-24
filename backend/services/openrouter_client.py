"""
Minimal OpenRouter client wrapper used for LLM explanations when an
OPENROUTER_API_KEY is configured. Keeps usage synchronous and tiny —
we only need a single helper to POST a chat completion and return text.

This module purposely avoids heavy dependencies and uses `requests`.

── MODEL STRATEGY (March 2026) ──────────────────────────────────────
We split free models into TIERS to maximize success rate:
  Tier 1: Reasoning models — newer, lower public traffic
  Tier 2: Confirmed alive (seen 429 in logs = they exist and respond)
  Tier 3: High traffic — alive but often rate-limited
  Tier 4: Catch-all fallback via openrouter/free auto-router

REMOVED (dead/404 as of March 2026):
  google/gemini-2.0-flash-exp:free, google/gemini-2.0-flash-lite:free,
  meta-llama/llama-4-scout:free, meta-llama/llama-3.1-405b-instruct:free,
  qwen/qwen-2.5-72b-instruct:free, mistralai/pixtral-12b:free,
  nvidia/nemotron-4-340b-instruct:free, deepseek/deepseek-chat:free
"""
from typing import Optional
import json
import logging
import random

import requests

from backend.config import settings

logger = logging.getLogger(__name__)

# ── VERIFIED FREE MODELS — Confirmed in OpenRouter catalog (March 2026) ──
# Tier 1: Large / newer models — high quality, lower public traffic
_TIER_1_QUALITY_LOW_TRAFFIC = [
    "qwen/qwen3-next-80b-a3b-instruct:free",      # 80B MoE, 262K ctx
    "openai/gpt-oss-120b:free",                    # 120B, 131K ctx
    "nousresearch/hermes-3-llama-3.1-405b:free",   # 405B, 131K ctx
    "arcee-ai/trinity-large-preview:free",          # 131K ctx
]

# Tier 2: Confirmed alive — medium models, solid quality
_TIER_2_RELIABLE = [
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "google/gemma-3-27b-it:free",
    "openai/gpt-oss-20b:free",
    "z-ai/glm-4.5-air:free",
    "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    "arcee-ai/trinity-mini:free",
]

# Tier 3: High traffic but confirmed alive in catalog
_TIER_3_HIGH_TRAFFIC = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "minimax/minimax-m2.5:free",
    "stepfun/step-3.5-flash:free",
]

_TIER_4_FALLBACK = [
    "openrouter/free",
]

_COMPACT_MODELS = [
    "qwen/qwen3-4b:free",
    "google/gemma-3-12b-it:free",
    "google/gemma-3-4b-it:free",
    "meta-llama/llama-3.2-3b-instruct:free",
]


def _build_model_list(max_tokens: int) -> list[str]:
    models = []
    if max_tokens <= 512:
        compact = _COMPACT_MODELS.copy()
        random.shuffle(compact)
        models.extend(compact)
    
    t1 = _TIER_1_QUALITY_LOW_TRAFFIC.copy()
    random.shuffle(t1)
    models.extend(t1)
    
    t2 = _TIER_2_RELIABLE.copy()
    random.shuffle(t2)
    models.extend(t2)
    
    t3 = _TIER_3_HIGH_TRAFFIC.copy()
    random.shuffle(t3)
    models.extend(t3)
    
    models.extend(_TIER_4_FALLBACK)
    return models


FREE_MODELS = (
    _TIER_1_QUALITY_LOW_TRAFFIC + _TIER_2_RELIABLE + 
    _TIER_3_HIGH_TRAFFIC + _TIER_4_FALLBACK
)


class OpenRouterError(RuntimeError):
    pass


def generate_completion(
    model: Optional[str] = None,
    system_instruction: str = "",
    user_message: str = "",
    max_tokens: int = 1024,
    temperature: float = 0.1,
) -> str:
    api_key = settings.openrouter_api_key
    gemini_key = settings.gemini_api_key

    if api_key:
        models_to_try = _build_model_list(max_tokens)
        primary_model = model or settings.openrouter_model
        if ":free" not in primary_model and "/" in primary_model:
            primary_model = f"{primary_model}:free"
        
        if primary_model in FREE_MODELS and primary_model in models_to_try:
            models_to_try.remove(primary_model)
            models_to_try.insert(0, primary_model)

        # Try up to 7 models before handing off to Gemini
        models_to_try = models_to_try[:7]

        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "X-Title": "Pathfinder AI",
            "HTTP-Referer": "https://pathfinder-ai.io", 
        }

        using_secondary = False

        for idx, current_model in enumerate(models_to_try):
            payload = {
                "model": current_model,
                "messages": [
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_message},
                ],
                "max_tokens": max_tokens,
                "temperature": temperature,
            }

            try:
                timeout_sec = 30 if max_tokens > 2000 else 20

                # Switch to secondary key after first few failures
                if not using_secondary and settings.openrouter_api_key_secondary and idx >= 3:
                    logger.info("Switching to SECONDARY OpenRouter Key")
                    headers["Authorization"] = f"Bearer {settings.openrouter_api_key_secondary}"
                    using_secondary = True

                logger.info("OpenRouter attempt %d/%d: %s", idx + 1, len(models_to_try), current_model)
                resp = requests.post(url, headers=headers, data=json.dumps(payload), timeout=timeout_sec)

                if resp.status_code == 200:
                    data = resp.json()
                    choices = data.get("choices", [])
                    if choices:
                        choice = choices[0]
                        msg = choice.get("message") or {}
                        text = msg.get("content") or msg.get("text") or choice.get("text")
                        if text and text.strip():
                            logger.info("OpenRouter SUCCESS: %s", current_model)
                            return text.strip()
                    logger.warning("OpenRouter model %s returned empty response", current_model)
                elif resp.status_code == 429:
                    # Free-tier per-minute limits — a 1-2s retry is useless.
                    # Fail fast to next model instead.
                    logger.warning("OpenRouter model %s rate limited (429) — next.", current_model)
                else:
                    logger.warning("OpenRouter model %s failed (%s)", current_model, resp.status_code)

            except requests.exceptions.Timeout:
                logger.warning("OpenRouter %s timed out — next model.", current_model)
            except Exception as exc:
                logger.warning("OpenRouter %s error: %s — next model.", current_model, str(exc)[:80])

    # 2. Ultimate Fallback: Direct Gemini API (aistudio.google.com)
    if gemini_key:
        logger.info("OpenRouter failed. Attempting Direct Gemini API fallback...")
        
        gemini_models = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.0-flash-lite"]
        keys_to_try = [gemini_key]
        if settings.gemini_api_key_secondary:
            keys_to_try.append(settings.gemini_api_key_secondary)
        
        for key in keys_to_try:
            for gemini_model in gemini_models:
                try:
                    from google import genai
                    client = genai.Client(api_key=key)
                    response = client.models.generate_content(
                        model=gemini_model,
                        contents=user_message,
                        config={
                            "system_instruction": system_instruction,
                            "max_output_tokens": max_tokens,
                            "temperature": temperature,
                        }
                    )
                    if response.text and response.text.strip():
                        return response.text.strip()
                except Exception:
                    continue

    raise OpenRouterError("All models (OpenRouter and Gemini) failed.")
