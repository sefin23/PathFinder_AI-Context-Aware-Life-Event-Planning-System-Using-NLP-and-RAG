"""
Layer 4.2 — Recommendation Engine.

Implements context-aware, non-authoritative suggestions based on workflow state.
"""

from typing import List, Dict
from datetime import datetime, timezone

from backend.models.task_model import Task, TaskStatus

def generate_recommendations(
    tasks: List[Task], 
) -> Dict[str, List[Dict[str, str]]]:
    """
    Generates suggestions based on workflow progress, dependency unlocks,
    deadlines, and stage transitions.

    Returns: A dictionary of recommendations with a message and a reason.
    """
    recommendations = []
    
    total_tasks = len(tasks)
    if total_tasks == 0:
        return {"recommendations": recommendations}
    
    completed_tasks = [t for t in tasks if t.status == TaskStatus.completed]
    pending_tasks = [t for t in tasks if t.status != TaskStatus.completed]
    
    # 1. Progress Milestone Rule
    completion_rate = len(completed_tasks) / total_tasks
    if 0.5 <= completion_rate < 1.0:
        recommendations.append({
            "message": "You have completed more than half of your workflow! Focus on remaining logistical tasks.",
            "reason": "progress_milestone"
        })
    elif completion_rate == 1.0:
        recommendations.append({
            "message": "Congratulations on completing all tasks in this workflow!",
            "reason": "workflow_complete"
        })
        
    # We need to collect parent tracking details for dependency and category completion
    completed_parent_ids = {t.parent_id for t in completed_tasks if t.parent_id is not None}
    tasks_by_parent = {}
    for t in tasks:
        if t.parent_id is not None:
             if t.parent_id not in tasks_by_parent:
                 tasks_by_parent[t.parent_id] = []
             tasks_by_parent[t.parent_id].append(t)

    # 2. Category / Parent Completion Rule
    for parent_id, children in tasks_by_parent.items():
        if all(c.status == TaskStatus.completed for c in children):
            parent_task = next((t for t in tasks if t.id == parent_id), None)
            if parent_task and parent_task.status != TaskStatus.completed:
                 recommendations.append({
                    "message": f"All sub-steps for '{parent_task.title}' appear ready. Consider marking it as complete to unlock the next steps.",
                    "reason": "category_phase_complete"
                 })

    # 3. Dependency Unlock Rule
    # Look for tasks whose parent was just completed, or is about to be.
    for p in pending_tasks:
        if p.parent_id is not None:
            parent = next((t for t in tasks if t.id == p.parent_id), None)
            if parent and parent.status == TaskStatus.completed:
                recommendations.append({
                    "message": f"Your progress unlocked a new step. You can now begin: '{p.title}'.",
                    "reason": "dependency_unlock"
                })

    # 4. Deadline Reminder Rule
    now_utc = datetime.now(timezone.utc)
    for p in pending_tasks:
        if p.due_date is not None:
            # Simple check, real checking will be timezone aware later if sent to user via digest,
            # this is for dashboard only.
            due_aware = p.due_date if p.due_date.tzinfo else p.due_date.replace(tzinfo=timezone.utc)
            days_until = (due_aware - now_utc).total_seconds() / 86400

            if 0 <= days_until < 3:
                 recommendations.append({
                    "message": f"The deadline for '{p.title}' is approaching soon. Consider prioritizing it.",
                    "reason": "approaching_deadline"
                })

    # Return only the top 3 recommendations to avoid overwhelming the user
    return {"recommendations": recommendations[:3]}

# =========================================================================
# Recommendation Philosophy
# =========================================================================
# Why the system suggests rather than commands:
# Pathfinder AI operates on the core principle that the user is always in
# control of their life events. Automation is intentionally limited to 
# data aggregation and progress monitoring. Making decisions for the user
# risks incorrect advice (due to nuanced real-world circumstances) and 
# reduces user trust. Recommendations are framed as gentle, context-aware 
# suggestions ("Consider prioritizing...", "You can now begin...") rather 
# than commands ("Do this now!"). By remaining explainable and transparent, 
# the user understands why a suggestion was made (e.g., a deadline is near 
# or a preceding milestone was reached), allowing them to confidently accept 
# or ignore the advice without breaking the application logic. 
