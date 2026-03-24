from backend.database import SessionLocal
from backend.services.workflow_generation_service import propose_workflow
from backend.schemas.nlp_schema import LifeEventType
import json
import logging

# Set up logging so we can see what's happening
logging.basicConfig(level=logging.INFO)

def test_workflow_proposal():
    db = SessionLocal()
    try:
        # Test case: Job Onboarding in Bengaluru
        life_event_types = [LifeEventType.JOB_ONBOARDING]
        location = "Bengaluru, India"
        timeline = "within 30 days"
        
        print(f"Testing workflow proposal for: {life_event_types} in {location}")
        
        response = propose_workflow(
            db=db,
            life_event_types=life_event_types,
            location=location,
            timeline=timeline,
            top_k=5
        )
        
        print(f"Success: {response.success}")
        print(f"Fallback Template: {response.fallback_template}")
        print(f"Number of Tasks: {len(response.tasks)}")
        
        if response.tasks:
            for i, task in enumerate(response.tasks, 1):
                print(f"{i}. [{task.phase_title}] {task.title} (Type: {task.task_type})")
                if task.portal_url:
                    print(f"   Portal: {task.portal_url}")
                if task.subtasks:
                    for sub in task.subtasks:
                        print(f"      - {sub.title}")
        
        if response.error:
            print(f"Error: {response.error}")
            
    finally:
        db.close()

if __name__ == "__main__":
    test_workflow_proposal()
