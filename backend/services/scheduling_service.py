"""
Scheduling Service - Handles task date estimation and conflict detection.
"""
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.models.task_model import Task
from backend.models.life_event_model import LifeEvent


def calculate_task_dates(
    tasks: List[Dict],
    start_date: str,
    user_id: int,
    db: Session
) -> List[Dict]:
    """
    Calculate suggested scheduled dates for tasks based on:
    - Life event start date
    - Task priority
    - Task dependencies (via suggested_due_offset_days)
    - Existing user schedule

    Returns tasks with scheduled_date field populated.
    """
    if not start_date:
        return tasks

    try:
        base_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    except (ValueError, AttributeError):
        return tasks

    # Sort tasks by priority (higher first) and offset days
    sorted_tasks = sorted(
        tasks,
        key=lambda t: (
            -(t.get('priority', 3)),
            t.get('suggested_due_offset_days', 999)
        )
    )

    # Calculate dates
    for task in sorted_tasks:
        offset_days = task.get('suggested_due_offset_days', 0)
        if offset_days is not None:
            task['scheduled_date'] = (base_date + timedelta(days=offset_days)).isoformat()

        # Recursively process subtasks
        if 'subtasks' in task and task['subtasks']:
            task['subtasks'] = calculate_task_dates(
                task['subtasks'],
                start_date,
                user_id,
                db
            )

    return sorted_tasks


def detect_conflicts(
    task_id: int,
    scheduled_date: datetime,
    user_id: int,
    db: Session
) -> Tuple[bool, List[Dict]]:
    """
    Detect if a task's scheduled date conflicts with other tasks.

    A conflict occurs when:
    - Multiple high-priority tasks are scheduled on the same day
    - Tasks from different life events overlap

    Returns: (has_conflict, conflicting_tasks)
    """
    if not scheduled_date:
        return False, []

    # Get all tasks scheduled on the same date for this user
    date_start = scheduled_date.replace(hour=0, minute=0, second=0, microsecond=0)
    date_end = date_start + timedelta(days=1)

    conflicting_tasks = db.query(Task).join(LifeEvent).filter(
        LifeEvent.user_id == user_id,
        Task.id != task_id,
        Task.scheduled_date >= date_start,
        Task.scheduled_date < date_end,
        Task.status.in_(['pending', 'in_progress'])
    ).all()

    # Check if there's an actual conflict
    # Conflict = 2+ high priority tasks (priority <= 2) on same day
    high_priority_count = sum(1 for t in conflicting_tasks if t.priority <= 2)
    current_task_high_priority = False  # We'd need to query this separately if needed

    has_conflict = len(conflicting_tasks) >= 2 and high_priority_count >= 1

    conflict_list = [
        {
            'id': t.id,
            'title': t.title,
            'priority': t.priority,
            'life_event_id': t.life_event_id,
            'scheduled_date': t.scheduled_date.isoformat() if t.scheduled_date else None
        }
        for t in conflicting_tasks
    ]

    return has_conflict, conflict_list


def resolve_conflict_auto(
    task_id: int,
    scheduled_date: datetime,
    resolution: str,
    user_id: int,
    db: Session
) -> Dict:
    """
    Auto-resolve a scheduling conflict based on user's choice.

    Resolution options:
    - 'reschedule_others': Move conflicting tasks to next available day
    - 'reschedule_current': Move current task to next available day
    - 'accept_conflict': Keep all tasks as-is (user will handle manually)

    Returns: Updated task info
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return {'error': 'Task not found'}

    has_conflict, conflicting = detect_conflicts(task_id, scheduled_date, user_id, db)

    if resolution == 'reschedule_others':
        # Move conflicting tasks to the next day
        for conflict in conflicting:
            conflict_task = db.query(Task).filter(Task.id == conflict['id']).first()
            if conflict_task and conflict_task.scheduled_date:
                conflict_task.scheduled_date = conflict_task.scheduled_date + timedelta(days=1)

        task.scheduled_date = scheduled_date
        db.commit()

    elif resolution == 'reschedule_current':
        # Find next available day
        next_date = scheduled_date + timedelta(days=1)
        while True:
            has_conflict_next, _ = detect_conflicts(task_id, next_date, user_id, db)
            if not has_conflict_next:
                break
            next_date += timedelta(days=1)
            # Prevent infinite loop
            if (next_date - scheduled_date).days > 30:
                break

        task.scheduled_date = next_date
        db.commit()

    elif resolution == 'accept_conflict':
        # Just set the date, user acknowledges conflict
        task.scheduled_date = scheduled_date
        db.commit()

    db.refresh(task)

    return {
        'id': task.id,
        'scheduled_date': task.scheduled_date.isoformat() if task.scheduled_date else None,
        'conflicts_resolved': len(conflicting) if resolution != 'accept_conflict' else 0
    }
