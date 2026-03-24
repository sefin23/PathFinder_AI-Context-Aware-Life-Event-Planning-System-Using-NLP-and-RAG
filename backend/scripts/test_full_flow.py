
from backend.database import SessionLocal
from backend.services.workflow_generation_service import propose_workflow
from backend.services.workflow_approval_service import approve_workflow
from backend.schemas.nlp_schema import LifeEventType
from backend.models.user_model import User
from backend.models.life_event_model import LifeEvent
from backend.schemas.workflow_approval_schema import WorkflowApprovalRequest, ApprovedTask, ApprovedSubtask
import json
import logging
import sys

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_full_flow():
    db = SessionLocal()
    try:
        # 1. Ensure a user exists
        user = db.query(User).filter(User.id == 1).first()
        if not user:
            logger.info("Creating demo user...")
            user = User(id=1, name="Demo User", email="demo@example.com", timezone="Asia/Kolkata")
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # 2. Ensure a LifeEvent exists for the user
        life_event = db.query(LifeEvent).filter(LifeEvent.user_id == 1).first()
        if not life_event:
            logger.info("Creating demo life event...")
            life_event = LifeEvent(title="Job Onboarding in Bengaluru", user_id=1)
            db.add(life_event)
            db.commit()
            db.refresh(life_event)

        # 3. Propose workflow
        life_event_types = [LifeEventType.JOB_ONBOARDING]
        location = "Bengaluru, India"
        timeline = "within 30 days"
        
        logger.info(f"Proposing workflow for: {life_event_types} in {location}")
        proposal = propose_workflow(
            db=db,
            life_event_types=life_event_types,
            location=location,
            timeline=timeline,
            top_k=5
        )
        
        if not proposal.success or not proposal.tasks:
            logger.error(f"Proposal failed: {proposal.error}")
            return

        logger.info(f"Proposal success. Generated {len(proposal.tasks)} tasks.")

        # 4. Approve workflow
        # Convert proposal to approval request
        approved_tasks = []
        for t in proposal.tasks:
            subs = [ApprovedSubtask(title=st.title, priority=st.priority, suggested_due_offset_days=st.suggested_due_offset_days) for st in t.subtasks]
            approved_tasks.append(ApprovedTask(
                title=t.title,
                description=t.description,
                phase_title=t.phase_title,
                priority=t.priority,
                due_offset_days=t.suggested_due_offset_days, # Corrected: due_offset_days instead of suggested_due_offset_days
                subtasks=subs,
                task_type=t.task_type
            ))
        
        approval_req = WorkflowApprovalRequest(
            life_event_id=life_event.id, # Corrected: life_event_id instead of user_id etc.
            approved_tasks=approved_tasks
        )
        
        logger.info("Approving workflow...")
        result = approve_workflow(db, approval_req)
        
        if result.success:
            logger.info(f"✅ Workflow approved! Life Event ID: {result.life_event_id}")
            # Verify in DB
            event = db.query(LifeEvent).filter(LifeEvent.id == result.life_event_id).first()
            if event:
                logger.info(f"Event found: {event.title} with {len(event.tasks)} tasks.")
        else:
            logger.error(f"Approval failed: {result.message}")
            
    finally:
        db.close()

if __name__ == "__main__":
    test_full_flow()
