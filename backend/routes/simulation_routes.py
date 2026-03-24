from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from backend.database import get_db
from backend.models.simulation_model import TaskDependency, SimulationLog
from backend.models.task_model import Task, TaskStatus

router = APIRouter()

def get_affected_tasks(db: Session, plan_id: int, source_task_id: int, delay_days: int):
    """
    BFS through dependency graph to find all tasks impacted by a delay.
    """
    # 1. Fetch all dependencies for this plan
    deps = db.query(TaskDependency).filter(TaskDependency.plan_id == plan_id).all()
    
    # 2. Build adjacency list: {blocker_id -> [list of tasks it blocks]}
    adj = {}
    impact_map = {}
    for d in deps:
        adj.setdefault(d.blocked_by_id, []).append(d.task_id)
        impact_map[d.task_id] = d.joining_impact
        
    # 3. BFS
    visited = set()
    queue = [source_task_id]
    chain = []
    joining_shift = 0.0
    
    # Initial task impact if exists
    if source_task_id in impact_map:
        joining_shift = delay_days * impact_map[source_task_id]

    while queue:
        current = queue.pop(0)
        for blocked_id in adj.get(current, []):
            if blocked_id not in visited:
                visited.add(blocked_id)
                chain.append(blocked_id)
                queue.append(blocked_id)
                # Calculate joining date impact (simplified: max delay propagated)
                ji = impact_map.get(blocked_id, 0.0)
                joining_shift = max(joining_shift, delay_days * ji)

    return {
        "affected_tasks": chain,
        "joining_date_shift_days": round(joining_shift),
        "ripple_chain": chain[:5], # First 5 for UI display
        "affected_count": len(chain)
    }

@router.get("/{plan_id}/dependencies")
def get_plan_dependencies(plan_id: int, db: Session = Depends(get_db)):
    """Return the dependency graph for a plan."""
    deps = db.query(TaskDependency).filter(TaskDependency.plan_id == plan_id).all()
    return deps

@router.post("/delay")
def simulate_delay(plan_id: int, task_id: int, delay_days: int, db: Session = Depends(get_db)):
    """Calculate the ripple effect of a task delay."""
    result = get_affected_tasks(db, plan_id, task_id, delay_days)
    
    # Severity score logic
    # (delay / 14 days max) * weight of task
    task = db.query(Task).filter(Task.id == task_id).first()
    severity = min(100, int((delay_days / 14) * 100))
    
    return {
        **result,
        "severity_score": severity
    }

@router.post("/accept")
def accept_delay(plan_id: int, task_id: int, delay_days: int, db: Session = Depends(get_db)):
    """Apply the delay to the database."""
    result = get_affected_tasks(db, plan_id, task_id, delay_days)
    
    all_affected = [task_id] + result["affected_tasks"]
    
    # Update due dates
    tasks = db.query(Task).filter(Task.id.in_(all_affected)).all()
    for t in tasks:
        if t.due_date:
            t.due_date = t.due_date + timedelta(days=delay_days)
    
    # Log the simulation
    log = SimulationLog(
        user_id=1, # Demo User
        plan_id=plan_id,
        task_id=task_id,
        delay_days=delay_days,
        accepted=True
    )
    db.add(log)
    
    # Update user stats for V2 nav promotion
    # Logic omitted for now as it's V2, but we'll increment the counter
    # ...
    
    db.commit()
    return {"updated_count": len(all_affected)}
