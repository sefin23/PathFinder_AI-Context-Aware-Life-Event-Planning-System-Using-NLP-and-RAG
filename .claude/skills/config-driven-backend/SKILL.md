# Config-Driven Backend Skill

**Auto-trigger keywords:** portal, registry, task_type, timeline, URN pattern, state portal, hardcode

## Core Rules

1. **Never hardcode portal URLs, timelines, or URN patterns**
   - All configuration comes from `backend/data/portal_registry.json`
   - Always use `portal_registry_service.py` helpers

2. **When adding/modifying tasks:**
   - Check if `task_type` exists in portal_registry.json
   - If new task_type needed, update registry JSON first
   - Then update code to use registry helpers

3. **Required helpers to use:**
   ```python
   from backend.services.portal_registry_service import (
       get_portal_for_task,
       get_timeline,
       get_urn_patterns,
       get_prerequisites
   )
   ```

4. **Before any task logic change:**
   - Read portal_registry.json to understand current config
   - Update registry if needed
   - Write/update unit tests
   - Then implement code changes

## Examples

### ❌ Bad (hardcoded)
```python
if task.task_type == "domicile_certificate" and city == "Bengaluru":
    portal_url = "https://sevasindhu.karnataka.gov.in"
```

### ✅ Good (config-driven)
```python
portal_info = get_portal_for_task(task.task_type, task.state_code, task.job_city)
if portal_info:
    portal_url = portal_info["url"]
```

## When this skill applies

- Any work involving task creation/updates
- Adding new states, cities, or task types
- Modifying portal URLs or timelines
- URN/reference ID extraction logic
- Task prerequisite or timeline calculations

See [reference.md](./reference.md) for JSON schema and full examples.
