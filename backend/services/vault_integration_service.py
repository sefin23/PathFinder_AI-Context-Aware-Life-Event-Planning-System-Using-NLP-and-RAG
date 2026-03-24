import json
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

from sqlalchemy.orm import Session
from backend.models import User, VaultDocument, Task, LifeEvent, TaskStatus
from backend.services.vision_service import analyze_document_vision
from backend.services.portal_registry_service import registry

logger = logging.getLogger(__name__)

def process_vault_extraction(db: Session, doc_id: int):
    """
    Main entry point for processing a newly uploaded vault document.
    1. Runs Gemini Vision to extract fields.
    2. Stores them in the doc row.
    3. Applies them to the user profile and active plans.
    """
    doc = db.query(VaultDocument).filter(VaultDocument.id == doc_id).first()
    if not doc:
        return

    # 1. Run Intelligence (Gemini 2.0 Flash)
    # storage_url is like "/uploads/foo.jpg". We need the local path.
    local_path = doc.storage_url.replace("/uploads/", "backend/uploads/")
    if not os.path.exists(local_path):
        logger.error(f"File not found: {local_path}")
        return

    result = analyze_document_vision(local_path)
    
    if not result or result.get("confidence", 0) < 0.5:
        logger.warning(f"Low confidence vision result for doc {doc_id}")
        return

    # 2. Store extracted fields and update classification
    doc.extracted_fields = json.dumps(result)
    
    if result.get("category"):
        doc.doc_type = result["category"]
    
    if result.get("suggested_name"):
        # Keep original extension
        ext = os.path.splitext(doc.name)[1]
        new_name = result["suggested_name"]
        if not new_name.lower().endswith(ext.lower()):
            new_name += ext
        doc.name = new_name

    db.commit()

    # 3. Apply results
    user = db.query(User).filter(User.id == doc.user_id).first()
    if not user:
        return

    # Deep Merge Extracted Fields into User Profile (Universal)
    profile_data = json.loads(user.extracted_profile) if user.extracted_profile else {}
    
    # Merge everything from result into profile_data (excluding standard classification fields)
    skip_fields = ["category", "suggested_name", "confidence", "document_date"]
    for key, val in result.items():
        if key not in skip_fields and val is not None:
            # If key is metadata, merge it too
            if key == "metadata" and isinstance(val, dict):
                p_meta = profile_data.get("metadata", {})
                p_meta.update(val)
                profile_data["metadata"] = p_meta
            else:
                profile_data[key] = val

    # Handle location context (Universal mismatch detection)
    extracted_locations = result.get("locations", [])
    if extracted_locations and isinstance(extracted_locations, list):
        # We store the most prominent city for mismatch checks (if any)
        profile_data["current_city"] = extracted_locations[0]

    user.extracted_profile = json.dumps(profile_data)
    
    # Sync profile to main columns for Portal Registry lookups
    if profile_data.get("job_city"):
        user.job_city = profile_data["job_city"]
        from backend.services.portal_registry_service import registry
        state_code = registry.get_state_code_by_city(user.job_city)
        if state_code:
            user.state_code = state_code
    
    db.commit()

    # 4. Handle Reference IDs and URNs
    reference_id = result.get("reference_id")
    if not reference_id:
        # Try regex fallback from registry
        # We need to know which URN pattern to use. 
        # For now, iterate through all common ones or use category-based mapping.
        urn_map = {
            "identity": ["aadhaar_update", "pan_application"],
            "employment": ["epfo_claim"],
            "financial": ["epfo_claim"]
        }
        test_keys = urn_map.get(category, ["generic_portal_ref"])
        
        # We need text to run regex. If vision didn't give text, we might need OCR or just use the vision logic.
        # But analyze_document_vision returns a structured dict, not raw text.
        # Let's assume vision prompt is strong enough. If we really need regex on raw text, 
        # we'd need to modify analyze_document_vision to return full text.
        pass

    if reference_id:
        _match_and_update_task_reference(db, user, reference_id, category, result)

    # 5. Plan Side Effects
    if category == "employment" and result.get("joining_date"):
        _recalculate_plan_deadlines(db, user.id, result["joining_date"])

    # Check for consistency whenever we have updated data
    _check_profile_consistency(db, user.id)

def _recalculate_plan_deadlines(db: Session, user_id: int, joining_date_str: str):
    """
    If we find a joining date (e.g. from Offer Letter), shift all PENDING tasks
    in related plans to align with that date.
    """
    try:
        joining_date = datetime.strptime(joining_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except Exception:
        return

    plans = db.query(LifeEvent).filter(
        LifeEvent.user_id == user_id,
        LifeEvent.status == "active"
    ).all()

    for plan in plans:
        # Heuristic: If plan title mentions job/work/relocation, we adjust
        title_lower = plan.title.lower()
        is_relevant = any(k in title_lower for k in ["job", "work", "office", "relocat", "onboard"])
        if not is_relevant:
            continue

        pending_tasks = db.query(Task).filter(
            Task.life_event_id == plan.id,
            Task.status != "completed"
        ).all()

        for task in pending_tasks:
            # Smart Recalculation based on Phase
            # Kickoff tasks -> 7 days before joining
            # Arrival tasks -> 2 days before joining
            # Post-Arrival -> 3 days after joining
            
            phase = (task.phase_title or "").lower()
            if "kickoff" in phase or "prep" in phase:
                offset = -7
            elif "arrival" in phase:
                offset = -2
            elif "settle" in phase or "post" in phase:
                offset = 3
            else:
                offset = -3 # Default to 3 days prior
            
            task.due_date = joining_date + timedelta(days=offset)
        
    db.commit()
    logger.info(f"Shifted deadlines for user {user_id} based on joining date {joining_date_str}")

def _check_profile_consistency(db: Session, user_id: int):
    """
    Flags inconsistencies between identity documents (e.g. Current Address) 
    and target event parameters (e.g. Work Location).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user: return
    
    profile = json.loads(user.extracted_profile) if user.extracted_profile else {}
    
    current_city = profile.get("current_city")
    work_city = profile.get("job_city")
    
    if current_city and work_city and current_city.lower() != work_city.lower():
        # Store a flag/warning in extracted_profile
        profile["data_inconsistency"] = True
        profile["mismatch_details"] = f"Vault Address: {current_city} | Event Location: {work_city}"
        user.extracted_profile = json.dumps(profile)
        db.commit()
        logger.info(f"Data consistency flag for user {user_id}: {current_city} vs {work_city}")
    else:
        # Clear flag if they match or criteria not met
        if "data_inconsistency" in profile:
            profile.pop("data_inconsistency", None)
            profile.pop("mismatch_details", None)
            user.extracted_profile = json.dumps(profile)
            db.commit()
def _match_and_update_task_reference(db: Session, user: User, reference_id: str, category: str, result: dict):
    """
    Finds a pending task that semantic matching identifies as relevant to this document.
    Updates it to 'pending_verification' and stores the ID.
    """
    # 1. Get all pending tasks for this user
    tasks_query = db.query(Task).join(LifeEvent).filter(
        LifeEvent.user_id == user.id,
        Task.status.in_([TaskStatus.pending, TaskStatus.in_progress])
    ).all()

    if not tasks_query:
        return

    # Prepare document summary for LLM
    doc_summary = f"Type: {result.get('suggested_name')}. Category: {category}. Context: {result.get('extra_context')}"
    
    # 2. Use Universal AI Matcher
    from backend.services.nlp_service import suggest_task_match
    pending_task_list = [{"id": t.id, "title": t.title, "description": t.description} for t in tasks_query]
    
    matched_task_id = suggest_task_match(doc_summary, pending_task_list)
    
    if matched_task_id:
        target_task = db.query(Task).filter(Task.id == matched_task_id).first()
        if target_task:
            target_task.reference_id = reference_id
            target_task.status = TaskStatus.pending_verification
            
            # Set follow-up dates based on registry patterns if available
            from backend.services.portal_registry_service import registry
            timeline = registry.get_timeline(target_task.task_type) if target_task.task_type else {"first_followup_days": 14, "second_followup_days": 30}
            
            now = datetime.now(timezone.utc).replace(tzinfo=None)
            target_task.followup_date_1 = now + timedelta(days=timeline["first_followup_days"])
            target_task.followup_date_2 = now + timedelta(days=timeline["second_followup_days"])
            
            logger.info(f"Universal Match: Linked {doc_summary} to Task {target_task.id} ('{target_task.title}')")
            db.commit()
