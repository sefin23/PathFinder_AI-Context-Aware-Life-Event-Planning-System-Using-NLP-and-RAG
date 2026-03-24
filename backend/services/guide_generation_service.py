
import json
import logging
from typing import Optional
from sqlalchemy.orm import Session
from backend.models.task_model import Task
from backend.models.user_model import User
from backend.models.life_event_model import LifeEvent
from backend.models.vault_model import VaultDocument
from google import genai
from google.genai import types
from backend.config import settings

logger = logging.getLogger(__name__)

class GuideGenerationService:
    @staticmethod
    def generate_guide(task: Task, user: User, life_event: LifeEvent, db: Session) -> Optional[dict]:
        if not settings.gemini_api_key:
            logger.error("gemini_api_key not found in settings")
            return None

        client = genai.Client(api_key=settings.gemini_api_key)
        
        # Context extraction
        profile_data = json.loads(user.extracted_profile) if user.extracted_profile else {}
        narrative_context = life_event.description or "No context provided."
        
        # Document context from vault
        vault_docs = db.query(VaultDocument).filter(
            VaultDocument.user_id == user.id, 
            VaultDocument.deleted_at == None
        ).all()
        vault_list = [f"{d.name} ({d.doc_type})" for d in vault_docs]
        
        # Roadmap context (All tasks in this plan)
        roadmap_tasks = db.query(Task).filter(Task.life_event_id == life_event.id).all()
        roadmap_titles = [t.title for t in roadmap_tasks]
        
        prompt = f"""
You are the "Navigator" AI for Pathfinder. Your goal is to generate a highly personalized, step-by-step completion guide for a specific task.

TARGET TASK:
- Title: {task.title}
- Description: {task.description or "N/A"}

ROADMAP CONTEXT (All tasks in this plan):
{", ".join(roadmap_titles)}

USER CONTEXT (From previous discussions/chats):
{narrative_context}

USER PROFILE (REGIONAL CONTEXT):
- Name: {user.name}
- State/Region: {user.state_code or profile_data.get('state', 'Unknown')}
- Profile Details: {json.dumps(profile_data, indent=2)}

USER VAULT (Already uploaded):
{", ".join(vault_list) if vault_list else "None"}

INSTRUCTIONS:
1. REGIONAL ACCURACY (CRITICAL): The user is in {user.state_code or profile_data.get('state', 'India')}. If the task is a government or utility service (Aadhaar, PAN, ESIC, Ration Card, Voter ID, Land records), you MUST provide the state-specific portal and instructions for {user.state_code or profile_data.get('state', 'India')}.
2. STRATEGIC PERSPECTIVE: Don't just list steps. Think about the "hidden" tricks to get this done faster. Mention specific portals like UIDAI, NSDL, or ESIC IP portal as needed.
3. PERSONALIZATION: Use the user's city ({profile_data.get('current_city', 'your city')}), employer ({profile_data.get('employer', 'your company')}), and other profile details to make the instructions feel custom-tailored.
4. VAULT INTEGRATION: Identify which documents are needed. If they are in the 'USER VAULT', mark them as 'has: true'.
5. ACTIONS: Provide specific actions. For URLs, use hard links to the EXACT page if possible. For copy actions, provide the specific field value from the profile.
6. ACCESSIBILITY (CRITICAL): ALWAYS expand all acronyms (e.g. use 'Ministry of Corporate Affairs' instead of 'MCA', 'Human Resources' instead of 'HR') to ensure clarity for novice users. Provide detailed, beginner-friendly, and jargon-free instructions. Assume the user has no prior experience with the process.
7. TONE: Professional, encouraging, and extremely efficient.

OUTPUT FORMAT (Strict JSON):
{{
  "task_type": "dynamic_personalized_guide",
  "title": "{task.title}",
  "estimated_mins": 15,
  "url": "https://...",
  "steps": [
    {{
      "num": 1,
      "title": "Log in to portal",
      "description": "Visit the [State] e-district portal...",
      "action": {{
        "type": "link",
        "label": "Open Portal",
        "url": "https://..."
      }}
    }},
    {{
      "num": 2,
      "title": "Enter your details",
      "description": "Use your current address in Pune...",
      "action": {{
        "type": "copy",
        "label": "Copy Address",
        "value": "..."
      }}
    }}
  ],
  "prefilled": [
    {{
      "label": "Current City",
      "value": "Pune",
      "source_label": "from profile",
      "found": true
    }}
  ],
  "required_docs": [
    {{
      "name": "Aadhaar Card",
      "has": true
    }}
  ],
  "expected_result": "Success message or downloaded certificate.",
  "what_to_save": "Reference number (URN)"
}}

Only return the JSON. Make it premium and extremely helpful.
"""
        try:
            # Primary strategy: Gemini 2.0 Flash (Fastest, newest)
            try:
                response = client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )
                return json.loads(response.text)
            except Exception as inner_e:
                logger.warning(f"Gemini 2.0-flash failed, falling back to gemini-1.5-flash: {inner_e}")
                # Secondary strategy: Gemini 1.5 Flash (Most stable, reliable backup)
                response = client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )
                return json.loads(response.text)
        except Exception as e:
            logger.error(f"Dynamic guide generation failed (both models): {e}")
            return None
