"""
Layer 4.3 — Clarification System.

Generates follow-up questions when user input is ambiguous or has low NLP classification confidence.
"""

import json
import logging
import os
from sqlalchemy.orm import Session
from backend.services.openrouter_client import generate_completion as openrouter_generate, OpenRouterError
from backend.services.rag_service import retrieve
from backend.schemas.nlp_schema import LifeEventType
from backend.config import settings

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """\
You are "The Pathfinder," an elite life-event architect. The user's input was a bit vague, so we need a few more precise details to build an expert-level roadmap.

Your ONLY job is to generate 2-3 SHORT, SPECIFIC follow-up questions in JSON. Each question must target a distinct, actionable gap in the user's information.

Rules:
- Questions MUST be specific to the detected life-event type(s).
- NO generic questions like "can you share more?". Every question must have a clear strategic purpose.
- For PASSPORT: ask about urgency window, current status (renewal/new), and destination country.
- For RELOCATION: ask about destination city, reason for move (job/study/personal), and timeline.
- For JOB_ONBOARDING: ask about company city, joining date, and whether it's first job or switching.
- For BUSINESS_STARTUP: ask about business type, location, and funding status.
- For MARRIAGE_PLANNING: ask about ceremony type, budget range, and timeline.
- For VISA_APPLICATION: ask about visa type, destination country, and nationality.
- Speak directly to the user (use "you" and "your").
- Warm, expert tone — like a knowledgeable friend helping you.
- Return ONLY the JSON object — no markdown, no explanation, no code fences.

Example input: "I want to renew my passport"
Example output:
{
  "clarification_needed": true,
  "questions": [
    {"question": "Is this a renewal of an existing passport or a first-time application?"},
    {"question": "How urgently do you need it — is there a travel date or deadline we're working towards?"},
    {"question": "Which country are you applying in? (This determines the exact process and timelines.)"}
  ]
}
"""

# ──────────────────────────────────────────────────────────────────────────────
# Event-specific fallback questions (used if LLM call fails)
# ──────────────────────────────────────────────────────────────────────────────

_FALLBACK_QUESTIONS = {
    "VISA_APPLICATION": [
        {"question": "Which country are you applying for a visa to?"},
        {"question": "What type of visa do you need — work, student, tourist, or family visa?"},
        {"question": "How much time do you have before your planned travel date?"},
    ],
    "RELOCATION": [
        {"question": "Which city or country are we planning your move to?"},
        {"question": "Is this move primarily for work, studies, or a personal fresh start?"},
        {"question": "What's your target timeline — are you moving in the next 1 month, 3 months, or 6+ months?"},
    ],
    "INTERNATIONAL_TRAVEL": [
        {"question": "Which country is your destination?"},
        {"question": "Is this for leisure, business, or a long-term stay?"},
        {"question": "Do you already have a valid passport and visa, or do we need to sort those first?"},
    ],
    "LEGAL_AND_IDENTITY": [
        {"question": "Is this a renewal of an existing document or a first-time application?"},
        {"question": "How urgently do you need it — is there a specific deadline or travel date we're working towards?"},
        {"question": "Which country are you applying in? (This determines the exact process and official fees.)"},
    ],
    "JOB_ONBOARDING": [
        {"question": "Which city will you be joining the new company in?"},
        {"question": "Do you have a confirmed start date yet?"},
        {"question": "Is this your first job, or are you switching from a previous employer? (This affects PF transfer and notice period tasks.)"},
    ],
    "CAREER_TRANSITION": [
        {"question": "Are you moving into a new industry, or a similar role in a different company?"},
        {"question": "Do you have a notice period to serve, or are you transitioning immediately?"},
        {"question": "Is the new role in the same city, or will you also be relocating?"},
    ],
    "BUSINESS_STARTUP": [
        {"question": "What type of business are you planning to start — product, service, tech, or retail?"},
        {"question": "Which city or country will the business be registered in?"},
        {"question": "Are you bootstrapping, or are you looking to raise investment?"},
    ],
    "MARRIAGE_PLANNING": [
        {"question": "What's your target wedding date, or are you still in early planning mode?"},
        {"question": "Are you planning a civil ceremony, a religious ceremony, or both?"},
        {"question": "Are there any key legal documents you need to prepare (e.g., marriage registration, name change)?"},
    ],
    "HOME_PURCHASE": [
        {"question": "Are you looking to buy a new property or a resale property?"},
        {"question": "Which city are you looking to buy in?"},
        {"question": "Are you planning to take a home loan, or is this a self-funded purchase?"},
    ],
    "STUDY_ABROAD": [
        {"question": "Which country and university are you targeting?"},
        {"question": "What intake are you applying for — September/January of which year?"},
        {"question": "Have you started your standardized tests (IELTS/TOEFL/GRE), or is that still pending?"},
    ],
    "NRI_RETURN_TO_INDIA": [
        {"question": "Which city in India are you returning to?"},
        {"question": "Are you returning permanently, or is this a temporary stay?"},
        {"question": "Do you have any foreign assets, accounts, or investments that need to be repatriated?"},
    ],
    "VEHICLE_PURCHASE": [
        {"question": "Are you buying a new vehicle or a used one?"},
        {"question": "Which city will the vehicle be registered in?"},
        {"question": "Are you planning to finance it with a loan, or is this a cash purchase?"},
    ],
}

# Generic fallback for any event type not in the map
_GENERIC_FALLBACK = [
    {"question": "To lock in the most accurate roadmap, could you tell us a bit more about your specific situation?"},
    {"question": "Is there a specific city, country, or deadline we should plan around?"},
]


def _get_fallback_for_events(detected_events: list[str]) -> list[dict]:
    """Pick the best fallback questions based on detected event type."""
    for event in detected_events:
        if event in _FALLBACK_QUESTIONS:
            return _FALLBACK_QUESTIONS[event]
    # Try partial match (e.g., "LEGAL_AND_IDENTITY" covers passport)
    for event in detected_events:
        for key in _FALLBACK_QUESTIONS:
            if key in event or event in key:
                return _FALLBACK_QUESTIONS[key]
    return _GENERIC_FALLBACK


def generate_clarification_questions(db: Session, user_text: str, detected_events: list[str]) -> dict:
    """
    Asks the LLM to generate specific clarification questions based on vague user input,
    grounding them in Expert Knowledge (RAG + Portal Registry).
    
    PROACTIVE EXPERT CHECK: If we have high-quality pre-built questions for these events, 
    we use them immediately to ensure a premium experience and zero delay.
    """
    primary = settings.openrouter_model
    upper_text = user_text.upper()

    # 1. ── PROACTIVE EXPERT INJECTION ──────────────────────────────────────────
    # If the user input or detected events match our expert map, serve those first.
    # This prevents generic "share more detail" messages when we already know what to ask.
    expert_fallback = None
    
    # Priority A: Check for specific high-value keywords in the user text
    if "PASSPORT" in upper_text or "RENEWAL" in upper_text or "RENEW" in upper_text:
        expert_fallback = _FALLBACK_QUESTIONS.get("LEGAL_AND_IDENTITY")
    elif "MOVE" in upper_text or "RELOCAT" in upper_text or "RELOACT" in upper_text:
        expert_fallback = _FALLBACK_QUESTIONS.get("RELOCATION")
    elif "VISA" in upper_text:
        expert_fallback = _FALLBACK_QUESTIONS.get("VISA_APPLICATION")
    elif "JOB" in upper_text or "OFFER" in upper_text or "WORK" in upper_text:
        expert_fallback = _FALLBACK_QUESTIONS.get("JOB_ONBOARDING")
    
    # Priority B: Check for detected event types
    if not expert_fallback and detected_events:
        for event in detected_events:
            if event in _FALLBACK_QUESTIONS:
                expert_fallback = _FALLBACK_QUESTIONS[event]
                break

    # If we found an expert match, BYPASS THE AI and return immediately.
    # This guarantees the "Expert Pathfinder" feel even if the AI is slow or rate-limited.
    if expert_fallback:
        logger.info("Universal Expert Match found. Bypassing AI to serve high-fidelity questions.")
        return {
            "clarification_needed": True,
            "questions": expert_fallback
        }

    # 2. ── AI GENERATION (Only for truly unique/unknown situations) ────────────
    # Gather expert RAG context
    expert_context = ""
    if detected_events and detected_events[0] != "OTHER":
        try:
            event_type = LifeEventType(detected_events[0])
            chunks = retrieve(db, user_text, event_type, top_k=2)
            if chunks:
                summaries = [f"- {c.title}: {c.content[:200]}..." for c in chunks]
                expert_context = "\n\nExpert Knowledge (use this to ask informed questions):\n" + "\n".join(summaries)
        except Exception as e:
            logger.warning(f"RAG failed for clarification: {e}")

    # Gather Portal Registry context (JSON Info)
    portal_context = ""
    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        registry_path = os.path.join(base_dir, "backend", "data", "portal_registry.json")
        if os.path.exists(registry_path):
            with open(registry_path, "r", encoding="utf-8") as f:
                registry = json.load(f)
            relevant_bits = []
            for state_code, state_info in registry.get("states", {}).items():
                if state_code.upper() in upper_text or state_info.get("name", "").upper() in upper_text:
                    relevant_bits.append(f"State: {state_info['name']} - Portal: {list(state_info.get('portals', {}).values())[0].get('url_home', 'N/A') if state_info.get('portals') else 'N/A'}")
            if relevant_bits:
                portal_context = "\n\nRegional Portal Info:\n" + "\n".join(relevant_bits)
    except Exception as e:
        logger.warning(f"Portal Registry lookup failed: {e}")

    prompt = (
        f"User Input: \"{user_text}\"\n"
        f"Detected Event Type(s): {', '.join(detected_events) if detected_events else 'Unknown'}"
        f"{portal_context}"
        f"{expert_context}"
        f"\n\nGenerate 2-3 specific, targeted clarification questions for EXACTLY these event types."
    )

    try:
        raw_text = openrouter_generate(
            model=primary,
            system_instruction=_SYSTEM_PROMPT,
            user_message=prompt,
            max_tokens=400,
            temperature=0.3,
        )

        raw_text = raw_text.strip()
        if raw_text.startswith("```"):
            raw_text = raw_text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

        result = json.loads(raw_text)
        
        # Validate: if LLM returned only 1 generic question, use our fallback instead
        questions = result.get("questions", [])
        if len(questions) < 2 or (len(questions) == 1 and "more detail" in questions[0].get("question", "").lower()):
            logger.info("LLM returned generic question — using event-specific fallback.")
            return {
                "clarification_needed": True,
                "questions": _get_fallback_for_events(detected_events)
            }
        
        return result

    except Exception as exc:
        logger.warning(f"LLM clarification failed ({exc}), using pre-built event-specific fallback.")
        return {
            "clarification_needed": True,
            "questions": _get_fallback_for_events(detected_events)
        }
