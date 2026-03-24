"""
Layer 3.1 — Life Event Classification Service.

Uses OpenRouter (OpenAI-compatible) for LLM classification.
Gemini is reserved for embeddings only (RAG service).
Never writes to the database. Never creates tasks.
"""

import json
import logging
from sqlalchemy.orm import Session

from backend.config import settings
from backend.schemas.nlp_schema import LifeEventClassification, LifeEventType
from backend.services.openrouter_client import generate_completion as openrouter_generate, OpenRouterError
from backend.services.clarification_engine import generate_clarification_questions

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# OpenRouter config
# ---------------------------------------------------------------------------

# Allowed event types for classification
_ALLOWED_TYPES = ", ".join(e.value for e in LifeEventType)

_SYSTEM_PROMPT = f"""\
You are "The Pathfinder," an elite life-event architect and master strategist. Your tone is expert, empathetic, and proactive.

Your ONLY job is to analyse the user's text and return a valid JSON object with exactly these keys:
- life_event_types: array of one or more strings from the allowed list below
- display_title: string — A highly specific, human-friendly title reflecting exactly what the user is doing (e.g., 'Passport Renewal in India', 'Relocating to Dubai', 'Starting a Bakery'). DO NOT use generic category names like 'Legal and Identity Transition' or 'Moving'. Name the actual activity.
- location: string — city, state, or country from the text, or null if not mentioned
- timeline: string — time-frame from the text, or null if not mentioned
- enriched_narrative: string — Summarise the user's event and their answers into one or two natural sentences. Write it as a clean factual summary, no questions, no 'regarding', no 'you noted'. Just what they told you, compressed naturally. (e.g., 'Renewing an Indian passport, no immediate urgency.' or 'Launching a SaaS business, currently at idea stage.'). The location must become a descriptor, not a separate data point (e.g. 'Canadian visa', not 'visa, country: Canada').
- confidence: number between 0.0 and 1.0. IMPORTANT: Your confidence score must reflect ONLY the clarity of the event identity (e.g., 'Passport', 'Visa'). Do NOT lower confidence just because the event is 'not urgent', 'in the future', or 'exploratory'. Urgency and timeframe modifications belong EXCLUSIVELY in the `timeline` parameter. If you detect a core event, the confidence must be > 0.9.

Rules:
- TYPO CORRECTION: Automatically correct spellings like 'comapny' to 'company', etc.
- LOCATION: If a major country or city is mentioned, extract it as the location.
- DO NOT use generic titles. Give it character.
- Pick only from the allowed life_event_types: {_ALLOWED_TYPES}
- Return ONLY the JSON object — no markdown, no explanation.
"""


def _call_with_fallback(user_message: str) -> str:
    """
    Calls OpenRouter (which now handles its own fallbacks and direct Gemini failover).
    """
    return openrouter_generate(
        model=settings.openrouter_model,
        system_instruction=_SYSTEM_PROMPT,
        user_message=user_message,
        max_tokens=512,
        temperature=0.2,
    )


def classify_life_event(db: Session, text: str, skip_clarification: bool = False) -> LifeEventClassification | dict:
    """
    Send *text* to OpenRouter and return a validated LifeEventClassification.
    Or, if confidence is too low, return a dictionary containing clarification questions.

    Guarantees:
    - Always returns at least one life_event_type (never raises on partial LLM failures).
    - Falls back through multiple free models on rate-limit errors.
    - Returns OTHER + low confidence tag when fully unable to classify.

    Args:
        text: Free-form user description of their life situation.

    Returns:
        A fully validated :class:`LifeEventClassification` instance.

    Raises:
        RuntimeError: If API key is missing or all models fail at the network level.
    """
    if not settings.openrouter_api_key:
        raise RuntimeError(
            "OPENROUTER_API_KEY is not set. "
            "Add it to your .env file and restart the server."
        )

    try:
        raw_text = _call_with_fallback(text)
        logger.debug("OpenRouter classification response: %s", raw_text)

        # Strip markdown fences if the model added them despite instructions
        json_str = raw_text
        if "```json" in raw_text:
            json_str = raw_text.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_text:
            json_str = raw_text.split("```")[1].split("```")[0].strip()

        data = json.loads(json_str)

        conf = float(data.get("confidence", 0.0))
        types = [LifeEventType(t) for t in data.get("life_event_types", ["OTHER"])] # Default to OTHER if not present
        
        classification = LifeEventClassification(
            life_event_types=types,
            display_title=data.get("display_title", "New Event"),
            location=data.get("location"),
            timeline=data.get("timeline"),
            enriched_narrative=data.get("enriched_narrative", text),
            confidence=conf,
        )

        # ── Layer 3.5: Correction Layer (Sniffer Fallback) ────────────────
        # If the LLM failed to catch a location or event type due to typos, 
        # we check the sniffer before giving up and asking clarification.
        if classification.confidence < 0.6 or not classification.location:
            logger.info("Confidence or Location missing. Running emergency sniffer repair...")
            upper_text = text.upper()
            
            # Location Repair
            LOCATIONS = {
                "London": ["LONDON", "LONDO", "LODN", "LNDN", "LODNON"],
                "Dubai": ["DUBAI", "DUBA", "DXB"],
                "New York": ["NEW YORK", "NYC", "NY"],
                "Toronto": ["TORONTO", "TRNT"],
                "Singapore": ["SINGAPORE", "SGP", "SINGA"],
                "Berlin": ["BERLIN", "BRLN"],
                "Paris": ["PARIS", "PRIS"],
            }
            if not classification.location:
                for city, variants in LOCATIONS.items():
                    if any(v in upper_text for v in variants):
                        classification.location = city
                        logger.info("Location repaired: %s", city)
                        break

            # Type Repair (Additive) & Confidence Boosting
            boosted = False
            if any(w in upper_text for w in ["RELOTCAT", "RELOCAT", "RELAC", "TRANSIT", "LANDING", "LIVING", "MIGRAT"]):
                if LifeEventType.RELOCATION not in classification.life_event_types:
                    classification.life_event_types.append(LifeEventType.RELOCATION)
                classification.confidence = max(classification.confidence, 0.95)
                boosted = True
                logger.info("Type repaired & boosted: RELOCATION")
            
            if any(w in upper_text for w in ["JOB", "WORK", "CAREER", "ONBOARD", "EMPLOY"]):
                if LifeEventType.JOB_ONBOARDING not in classification.life_event_types:
                    classification.life_event_types.append(LifeEventType.JOB_ONBOARDING)
                classification.confidence = max(classification.confidence, 0.95)
                boosted = True
                logger.info("Type repaired & boosted: JOB_ONBOARDING")

            if any(w in upper_text for w in ["PASSPORT", "VISA", "IMMIG", "AADHAAR", "AADHAR", "LEGAL", "CITIZEN"]):
                if LifeEventType.LEGAL_AND_IDENTITY not in classification.life_event_types:
                    classification.life_event_types.append(LifeEventType.LEGAL_AND_IDENTITY)
                classification.confidence = max(classification.confidence, 0.95)
                boosted = True
                logger.info("Type repaired & boosted: LEGAL_AND_IDENTITY")

            if any(w in upper_text for w in ["STARTUP", "BUSINESS", "VENTURE", "COMPANY", "INCORP", "LAUNCH"]):
                if LifeEventType.BUSINESS_STARTUP not in classification.life_event_types:
                    classification.life_event_types.append(LifeEventType.BUSINESS_STARTUP)
                classification.confidence = max(classification.confidence, 0.95)
                boosted = True
                logger.info("Type repaired & boosted: BUSINESS_STARTUP")

        # ── Layer 4: Clarification Fallback ────────────────────────────────
        if not skip_clarification and (classification.confidence < 0.6 or not classification.location):
            logger.info("Triggering clarification fallback. Confidence: %s, Location: %s", classification.confidence, classification.location)
            return generate_clarification_questions(
                db=db, # Added missing DB session
                user_text=text, 
                detected_events=[t.value for t in classification.life_event_types]
            )

        return classification

    except OpenRouterError as exc:
        logger.warning("All LLM models failed, activating emergency keyword sniffer: %s", exc)

    except Exception as exc:
        logger.error("NLP pipeline failed (falling back to discovery): %s", exc)

    # ── ADVANCED EMERGENCY SNIFFER ──────────────────────────────────
    # Runs when the LLMs are fully offline/failing (Rate limits, API downtime).
    # We now collect ALL matching types and extract major locations to prevent "Confidence: 0".
    upper_text = text.upper()
    detected_types = []
    location_guess = None
    
    # Identify Types — split into HIGH-specificity (unambiguous event name) vs LOW-specificity (general words)
    high_specificity_match = False

    if any(w in upper_text for w in ["VISA", "PASSPORT", "GREEN CARD", "GREENCARD", "IMMIG", "CITIZENSHIP", "WORK PERMIT", "OCI", "PIO"]):
        detected_types.append(LifeEventType.LEGAL_AND_IDENTITY)
        high_specificity_match = True
    if any(w in upper_text for w in ["STARTUP", "INCORPORAT", "REGISTER.*COMPANY", "FOUND.*COMPANY", "LAUNCH.*BUSINESS", "START.*BUSINESS"]):
        detected_types.append(LifeEventType.BUSINESS_STARTUP)
        high_specificity_match = True
    if any(w in upper_text for w in ["MARRIAGE", "WEDDING", "MARRY", "MARRIED", "ENGAGEMENT"]):
        detected_types.append(LifeEventType.MARRIAGE_PLANNING)
        high_specificity_match = True
    if any(w in upper_text for w in ["PREGNANT", "PREGNANCY", "MATERNITY", "NEWBORN", "BABY SHOWER"]):
        detected_types.append(LifeEventType.PREGNANCY_PREPARATION)
        high_specificity_match = True
    if any(w in upper_text for w in ["RELOCATION", "RELOCAT", "MOVING TO", "SHIFTED TO", "MIGRAT"]):
        detected_types.append(LifeEventType.RELOCATION)
        high_specificity_match = True

    # Lower-specificity keywords — only add if not already covered by a high-specificity match
    if any(w in upper_text for w in ["COMPANY", "BUSINESS", "COMAPNY", "FOUND"]) and LifeEventType.BUSINESS_STARTUP not in detected_types:
        detected_types.append(LifeEventType.BUSINESS_STARTUP)
    if any(w in upper_text for w in ["JOB", "CAREER", "ONBOARD", "EMPLOY", "HIRED", "JOINING"]):
        detected_types.append(LifeEventType.JOB_ONBOARDING)
    if any(w in upper_text for w in ["MOVE", "TRANSIT", "LANDING", "SHIFTING", "LIVING IN"]) and LifeEventType.RELOCATION not in detected_types:
        detected_types.append(LifeEventType.RELOCATION)
    if any(w in upper_text for w in ["BABY", "CHILD", "BORN", "BIRTH"]) and LifeEventType.PREGNANCY_PREPARATION not in detected_types:
        detected_types.append(LifeEventType.PREGNANCY_PREPARATION)
    if any(w in upper_text for w in ["LEGAL", "CITIZEN", "IDENTITY", "AADHAAR", "AADHAR"]) and LifeEventType.LEGAL_AND_IDENTITY not in detected_types:
        detected_types.append(LifeEventType.LEGAL_AND_IDENTITY)
    if any(w in upper_text for w in ["LOAN", "MORTGAGE", "FINANCE", "INVEST", "PROPERTY", "HOUSE", "RENT", "FLAT", "APARTMENT"]):
        detected_types.append(LifeEventType.MONEY_AND_ASSETS)

    # Location Sniffer (Common cities & typos)
    LOCATIONS = {
        "London": ["LONDON", "LONDO", "LODN", "LNDN"],
        "Dubai": ["DUBAI", "DUBA", "DXB", "UNITED ARAB EMIRATES", "UAE"],
        "New York": ["NEW YORK", "NYC", "NY"],
        "Toronto": ["TORONTO", "TRNT"],
        "Singapore": ["SINGAPORE", "SGP", "SINGA"],
        "Berlin": ["BERLIN", "BRLN"],
        "Paris": ["PARIS", "PRIS"],
        "India": ["INDIA", "IND", "DELHI", "MUMBAI", "BANGALORE", "HYDERABAD"],
        "United States": ["USA", "US", "UNITED STATES", "AMERICA"],
        "Canada": ["CANADA", "CAN"],
        "Australia": ["AUSTRALIA", "AUS"],
        "Germany": ["GERMANY", "GERM", "DEUTSCHLAND"],
    }
    for city, variants in LOCATIONS.items():
        if any(v in upper_text for v in variants):
            location_guess = city.title()
            break

    if not detected_types:
        detected_types = [LifeEventType.OTHER]
        guessed_title = "Personal Planning Journey"
        keyword_confidence = 0.5
    else:
        # Higher confidence when we matched specific keywords + location
        keyword_confidence = 0.85 if location_guess else 0.75
        # Build a smart combined title
        # Build a smart combined title based on actual human terms
        if any(w in upper_text for w in ["PASSPORT", "VISA", "IMMIG"]):
            guessed_title = "Passport/Visa Process"
        elif any(w in upper_text for w in ["RENEWAL"]):
             guessed_title = "Document Renewal"
        elif any(w in upper_text for w in ["MARRY", "MARRIAGE", "WEDDING"]):
            guessed_title = "Wedding Planning"
        elif any(w in upper_text for w in ["BABY", "PREGNANT", "CHILD", "BORN"]):
            guessed_title = "Welcoming Your Baby"
        elif any(w in upper_text for w in ["STARTUP", "BUSINESS", "VENTURE", "COMPANY"]):
            guessed_title = "Business Launch"
        elif any(w in upper_text for w in ["RELOTCAT", "RELOCAT", "TRANSIT", "MOVE"]):
            guessed_title = "Relocation Process"
        else:
            type_labels = [t.value.replace('_', ' ').title() for t in detected_types]
            if len(type_labels) > 2:
                guessed_title = f"Multi-Phase {type_labels[0]} Strategy"
            elif len(type_labels) == 2:
                guessed_title = f"{type_labels[0]} & {type_labels[1]} Roadmap"
            else:
                guessed_title = f"{type_labels[0]} Transition"
            
        if location_guess:
            guessed_title += f" ({location_guess})"

    if skip_clarification:
        logger.info("Emergency fallback returning best-guess (conf=%.2f): %s", keyword_confidence, guessed_title)
        return LifeEventClassification(
            life_event_types=detected_types,
            display_title=guessed_title,
            location=location_guess,
            timeline=None,
            enriched_narrative=text,
            confidence=keyword_confidence,
        )

    # Otherwise, trigger CLARIFICATION to let the user help us out
    return generate_clarification_questions(
        db=db, # Added missing DB session in emergency call
        user_text=text,
        detected_events=[t.value for t in detected_types]
    )


from typing import Optional

def suggest_task_match(doc_summary: str, pending_tasks: list) -> Optional[int]:
    """
    Uses LLM to match a document to the most relevant task from a list.
    pending_tasks should be a list of dicts: {"id": 1, "title": "...", "description": "..."}
    Returns task_id or None.
    """
    if not pending_tasks:
        return None

    task_bullet_list = "\n".join([f"- ID {t['id']}: {t['title']} ({t['description']})" for t in pending_tasks])
    
    prompt = f"""
    You are an intelligent task-matching engine.
    Given a summary of a document, pick the MOST relevant task ID that this document might satisfy or prove completion for.
    If none of the tasks are relevant, return null.
    
    DOCUMENT SUMMARY:
    {doc_summary}
    
    PENDING TASKS:
    {task_bullet_list}
    
    Return ONLY the task ID (integer) or the word 'null'. No punctuation.
    """
    
    try:
        from backend.services.openrouter_client import generate_completion as openrouter_generate
        response = openrouter_generate(
            model=settings.openrouter_model,
            system_instruction="You are a precise task-matching assistant.",
            user_message=prompt,
            max_tokens=64,
            temperature=0.1
        )
        resp_text = response.strip().lower().replace("id", "").replace(":", "").strip()
        if 'null' in resp_text:
            return None
        return int(resp_text)
    except Exception as e:
        logger.error(f"Semantic task matching failed: {e}")
        return None
