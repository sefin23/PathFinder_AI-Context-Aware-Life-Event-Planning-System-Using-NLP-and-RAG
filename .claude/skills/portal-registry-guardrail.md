# Portal Registry Guardrail Skill

**Auto-applies when:** Working with portals, task types, states, cities, timelines, URNs, or prerequisites.

## The Golden Rule

**ALL portal configuration lives in `backend/data/portal_registry.json`**

Never, ever, EVER hardcode:
- Portal URLs
- Portal names
- Timeline durations (initial_days, follow_up_days)
- URN regex patterns
- Task prerequisites
- State/city mappings

## Mandatory Checks Before ANY Code Change

### 1. Is this task_type in the registry?

```bash
# Check registry first
cat backend/data/portal_registry.json | grep "task_type_name"
```

If NOT found → Update registry FIRST, then code.

### 2. Am I using the registry helpers?

**Required imports:**
```python
from backend.services.portal_registry_service import (
    get_portal_for_task,
    get_timeline,
    get_urn_patterns,
    get_prerequisites
)
```

**Forbidden patterns:**
```python
# ❌ NEVER DO THIS
if state == "KA":
    portal_url = "https://sevasindhu.karnataka.gov.in"

if task_type == "domicile":
    initial_days = 7
    follow_up_days = 14

# ✓ ALWAYS DO THIS
portal = get_portal_for_task(task_type, state_code, job_city)
timeline = get_timeline(task_type)
```

### 3. Did I update tests?

Before committing any registry change:
```python
# tests/test_portal_registry_service.py
def test_new_state_portal():
    """Verify new state portal is configured correctly"""
    portal = get_portal_for_task("domicile_certificate", "TN", "Chennai")

    assert portal is not None
    assert portal["name"] == "Tamil Nadu e-Services"
    assert portal["url"] == "https://edistrict.tn.gov.in"
```

## Portal Registry Structure

```json
{
  "states": {
    "KA": {
      "name": "Karnataka",
      "portals": {
        "Seva Sindhu": {
          "url": "https://sevasindhu.karnataka.gov.in",
          "task_types": ["domicile_certificate", "ration_card", "income_certificate"]
        }
      }
    }
  },
  "timeline_buffers": {
    "domicile_certificate": {
      "initial_days": 7,
      "follow_up_days": 14,
      "final_deadline_days": 30
    }
  },
  "urn_patterns": {
    "aadhaar_enrollment": {
      "regex": "\\d{4}/\\d{5}/\\d{5}",
      "example": "1234/56789/01234"
    }
  },
  "prerequisites": {
    "domicile_certificate": ["aadhaar", "proof_of_residence", "passport_photo"]
  }
}
```

## Workflow for Adding New Elements

### Adding a New State (e.g., Tamil Nadu)

**Step 1: Update Registry**
```json
{
  "states": {
    "TN": {
      "name": "Tamil Nadu",
      "portals": {
        "Tamil Nadu e-Services": {
          "url": "https://edistrict.tn.gov.in",
          "task_types": ["domicile_certificate", "community_certificate"]
        }
      }
    }
  }
}
```

**Step 2: Write Test**
```python
def test_tamil_nadu_domicile_portal():
    portal = get_portal_for_task("domicile_certificate", "TN", "Chennai")
    assert portal["url"] == "https://edistrict.tn.gov.in"
```

**Step 3: Verify Helper Works** (No code changes needed if helper is generic)
```python
# This should just work with updated registry
python -c "from backend.services.portal_registry_service import get_portal_for_task; print(get_portal_for_task('domicile_certificate', 'TN', 'Chennai'))"
```

### Adding a New Task Type (e.g., Marriage Certificate)

**Step 1: Add to Registry**
```json
{
  "timeline_buffers": {
    "marriage_certificate": {
      "initial_days": 3,
      "follow_up_days": 7,
      "final_deadline_days": 21
    }
  },
  "prerequisites": {
    "marriage_certificate": ["aadhaar_both_partners", "photos", "affidavit"]
  },
  "states": {
    "KA": {
      "portals": {
        "Seva Sindhu": {
          "task_types": [..., "marriage_certificate"]
        }
      }
    }
  }
}
```

**Step 2: Add to Knowledge Base** (optional)
```bash
# backend/data/knowledge_base/ - if you have curated guides
```

**Step 3: Test End-to-End**
```python
def test_marriage_certificate_bangalore_flow():
    # Create life event
    event = create_life_event("Getting married in Bangalore")

    # Generate workflow
    workflow = generate_workflow(event)

    # Verify marriage certificate task
    marriage_task = [t for t in workflow.tasks if t.task_type == "marriage_certificate"][0]

    assert marriage_task is not None
    assert marriage_task.portal_url == "https://sevasindhu.karnataka.gov.in"
    assert marriage_task.timeline.initial_days == 3
```

## Code Review Checklist

When reviewing any PR that touches tasks/portals:

- [ ] No hardcoded portal URLs in code
- [ ] No hardcoded timelines (initial_days, follow_up_days)
- [ ] No hardcoded URN patterns
- [ ] All new task_types added to portal_registry.json
- [ ] Tests updated for new states/task_types
- [ ] `portal_registry_service` helpers used throughout

## Auto-Validation Script

```python
# backend/scripts/validate_registry.py
import json
import re

def validate_registry():
    """Ensure registry structure is valid"""
    with open("backend/data/portal_registry.json") as f:
        registry = json.load(f)

    errors = []

    # Check all task_types have timelines
    for state, data in registry["states"].items():
        for portal_name, portal_data in data["portals"].items():
            for task_type in portal_data["task_types"]:
                if task_type not in registry["timeline_buffers"]:
                    errors.append(f"Missing timeline for {task_type}")

    # Check all URN patterns are valid regex
    for name, pattern_data in registry["urn_patterns"].items():
        try:
            re.compile(pattern_data["regex"])
        except re.error:
            errors.append(f"Invalid regex for {name}")

    if errors:
        print("❌ Registry validation failed:")
        for error in errors:
            print(f"  - {error}")
        return False
    else:
        print("✓ Registry validation passed")
        return True

if __name__ == "__main__":
    validate_registry()
```

## Frontend Integration

Frontend should NEVER duplicate portal logic:

```javascript
// ❌ Bad - hardcoded in frontend
if (task.task_type === 'domicile_certificate' && state === 'KA') {
  return <Button url="https://sevasindhu.karnataka.gov.in">Open Portal</Button>
}

// ✓ Good - uses API response from backend
<Button url={task.portal_url}>{task.portal_name}</Button>
```

**Rule:** Frontend renders what backend sends. Backend reads from registry.

## Auto-Application Rules

This skill AUTOMATICALLY applies when:
- Files mention: `portal`, `task_type`, `timeline`, `URN`, `state_code`, `job_city`
- Working in: `backend/services/portal_registry_service.py`, `backend/routes/task_routes.py`, workflow generation
- Adding new states, cities, or task types
- User says: "add portal", "new state", "new task type"

**Mandatory behavior:**
1. ALWAYS read portal_registry.json before making changes
2. ALWAYS update registry before code
3. ALWAYS write tests for new registry entries
4. NEVER allow hardcoded portal data to be committed
