"""
Layer 4.1 — Priority Engine.

Implements a deterministic, explainable rule-based scoring system for ranking tasks.
"""

from typing import Optional
from backend.models.task_model import Task, TaskStatus

def score_task(
    task: Task,
    delta_days: Optional[int] = None,
    dependencies_completed: bool = False,
    workflow_stage: str = "middle"
) -> float:
    """
    Computes an explainable priority score based on three core rules:
    - Deadline Proximity
    - Dependency Unlocks
    - Workflow Stage
    
    Returns: A float representing the final priority score.
    """
    base_score = task.priority * 10.0 # 10 to 50
    deadline_score = 0
    dependency_score = 0
    stage_score = 0
    
    # Rule 1: Deadline Proximity
    if delta_days is not None:
        if delta_days < 0:
            deadline_score = 50 + abs(delta_days) * 5
        elif delta_days <= 2:
            deadline_score = 50
        elif delta_days <= 7:
            deadline_score = 30
        elif delta_days <= 14:
            deadline_score = 10
        else:
            deadline_score = 5

    # Rule 2: Dependency Unlock
    if dependencies_completed:
        dependency_score = 25

    # Rule 3: Workflow Stage
    if workflow_stage == "early":
        stage_score = 10
    elif workflow_stage == "middle":
        stage_score = 5
    elif workflow_stage == "late":
        stage_score = 2
        
    return base_score + deadline_score + dependency_score + stage_score

# =========================================================================
# Priority Scoring Rules
# =========================================================================
# Why Rule-Based Scoring over Machine Learning?
# Pathfinder AI uses an intentional rule-based engine for task ranking instead
# of a "black box" machine learning model. This ensures predictable behavior,
# easy debugging, and builds user trust. When a task jumps to the top of the list,
# the user (and developers) can trace exactly why based on explicit rules.
#
# Score Calculation Breakdown:
# 1. Base Score: (Priority 1-5) * 10
# 2. Deadline Proximity:
#    - Overdue: +50 (+5 per day)
#    - <= 2 days: +50
#    - <= 7 days: +30
#    - <= 14 days: +10
#    - > 14 days: +5
# 3. Dependency Unlocks:
#    - Preceding tasks completed: +25
# 4. Workflow Stage:
#    - Early: +10, Middle: +5, Late: +2
#
# Explainable Design:
# For non-technical users, this behaves intuitively: tasks that are due very
# soon, or tasks that were waiting on previous steps, naturally float to the
# top of their to-do list without requiring complex AI inference.
