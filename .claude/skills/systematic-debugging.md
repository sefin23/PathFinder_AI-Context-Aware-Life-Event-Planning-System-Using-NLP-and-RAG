# Systematic Debugging Skill

**Auto-applies when:** Debugging issues, fixing bugs, investigating errors, or troubleshooting failures.

## The Debugging Process (No Random Edits!)

### Phase 1: REPRODUCE
Before touching any code, reliably reproduce the bug.

**Steps:**
1. Document exact steps to trigger the bug
2. Note the expected vs actual behavior
3. Capture error messages, stack traces, console output
4. Identify affected versions/environments

**Template:**
```
## Bug Report

**Steps to Reproduce:**
1. Navigate to [page/action]
2. Click [button/element]
3. Observe [behavior]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Error Messages:**
[Copy full error text]

**Environment:**
- Browser: [Chrome 120]
- OS: [Windows 11]
- Backend: [Running/Not running]
```

### Phase 2: ISOLATE
Narrow down the root cause using systematic elimination.

**Techniques:**

1. **Binary Search**
   - Comment out half the code
   - Does bug still occur?
   - If yes, bug is in remaining half
   - If no, bug is in commented half
   - Repeat until isolated

2. **Add Logging**
```python
# Backend
print(f"[DEBUG] Variable value: {variable}")
print(f"[DEBUG] Function called with: {args}")
print(f"[DEBUG] Condition result: {condition}")

# Frontend
console.log('[DEBUG] State:', state)
console.log('[DEBUG] Props:', props)
console.log('[DEBUG] API response:', response)
```

3. **Check Assumptions**
   - Is the data shape what you expect?
   - Is the function actually being called?
   - Are environment variables loaded?
   - Is the database connection active?

### Phase 3: UNDERSTAND ROOT CAUSE
Don't just patch symptoms - understand WHY it's broken.

**Questions to Ask:**
1. What was this code supposed to do?
2. What assumption broke?
3. When did this start failing? (recent changes?)
4. Are there related issues elsewhere?

**Common Root Causes in Pathfinder AI:**

**Backend:**
- Missing field in Pydantic schema (like `scheduled_date`)
- Hardcoded values instead of registry lookup
- Database constraint violations
- Missing error handling
- Incorrect state/city mapping

**Frontend:**
- Undefined props (missing null checks)
- API response shape changed
- Missing error boundaries
- Race conditions in async code
- CSS specificity conflicts

### Phase 4: WRITE FAILING TEST
Create a test that reproduces the bug.

**Why:**
- Proves you understand the bug
- Prevents regression
- Documents expected behavior

**Example:**
```python
def test_workflow_approval_with_scheduled_date():
    """
    Bug: ApprovedTask schema missing scheduled_date field
    Cause: Field exists in ApprovedSubtask but not ApprovedTask
    """
    task_data = {
        "title": "Test Task",
        "priority": 1,
        "due_offset_days": 7,
        "scheduled_date": datetime.now()  # This should not fail
    }

    # This test should pass after fix
    task = ApprovedTask(**task_data)
    assert task.scheduled_date is not None
```

### Phase 5: FIX AT THE SOURCE
Fix the root cause, not the symptom.

**Anti-Pattern:**
```python
# ❌ Patching symptoms
try:
    portal_url = task.portal_url
except AttributeError:
    portal_url = "https://default-portal.com"  # Hardcoded fallback!
```

**Good Pattern:**
```python
# ✓ Fixing root cause
# 1. Add task_type to portal_registry.json
# 2. Update get_portal_for_task() to handle edge case
# 3. Add validation to catch missing portals early
portal = get_portal_for_task(task.task_type, task.state_code, task.job_city)
if not portal:
    raise ValueError(f"Portal not configured for {task.task_type} in {task.state_code}")
```

### Phase 6: VERIFY FIX
Confirm the bug is fixed and nothing else broke.

**Checklist:**
- [ ] Original bug no longer occurs
- [ ] Test passes
- [ ] No new errors in console/logs
- [ ] Related features still work
- [ ] Edge cases handled

## Debugging Tools & Techniques

### Backend Debugging

**1. Python Debugger (pdb)**
```python
import pdb; pdb.set_trace()  # Breakpoint

# Interactive commands:
# n - next line
# s - step into function
# c - continue
# p variable - print variable
# l - show current code
```

**2. Logging**
```python
import logging
logger = logging.getLogger(__name__)

logger.debug("Detailed info for debugging")
logger.info("General information")
logger.warning("Warning message")
logger.error("Error occurred", exc_info=True)  # Includes stack trace
```

**3. Database Inspection**
```bash
# SQLite
sqlite3 backend/sql_app.db
.tables
.schema life_events
SELECT * FROM life_events WHERE id = 1;

# Or using Python
python -c "from backend.database import SessionLocal; db = SessionLocal(); from backend.models.life_event_model import LifeEvent; print(db.query(LifeEvent).all())"
```

**4. API Testing**
```bash
# Test endpoint directly
curl -X GET http://localhost:8000/api/life-events/?user_id=1
curl -X POST http://localhost:8000/api/life-events/approve-workflow \
  -H "Content-Type: application/json" \
  -d '{"life_event_id": 1, "approved_tasks": [...]}'
```

### Frontend Debugging

**1. React DevTools**
- Inspect component props
- Check state values
- View component tree

**2. Console Debugging**
```javascript
// Strategic logging
console.log('[Component] Rendering with props:', props)
console.log('[API] Request:', requestData)
console.log('[API] Response:', response)
console.log('[State] Updated to:', newState)

// Table view for objects
console.table(arrayOfObjects)

// Group related logs
console.group('API Call')
console.log('Request:', request)
console.log('Response:', response)
console.groupEnd()
```

**3. Network Tab**
- Check API requests/responses
- Verify status codes
- Inspect payload data

**4. Breakpoints**
- In browser DevTools, click line number to add breakpoint
- Code pauses at that line
- Inspect variables in Scope panel

### Common Pathfinder AI Bug Patterns

**Pattern 1: 503 Service Unavailable on workflow approval**
```
Root Cause: Missing field in Pydantic schema
Fix: Add field to schema (e.g., scheduled_date to ApprovedTask)
Prevention: Keep schemas in sync with database models
```

**Pattern 2: "No tasks found" after creating event**
```
Root Cause: Workflow approval failed silently
Debug: Check backend logs for exceptions
Fix: Address schema/validation errors
Prevention: Add error handling + user feedback
```

**Pattern 3: Wrong portal URL for task**
```
Root Cause: Hardcoded URL or wrong state/city mapping
Debug: Check portal_registry.json and city_to_state mapping
Fix: Update registry or mapping
Prevention: Always use get_portal_for_task()
```

**Pattern 4: URN extraction not working**
```
Root Cause: Gemini API failure or regex pattern mismatch
Debug: Check Gemini response, test regex patterns
Fix: Add fallback logic, update URN patterns in registry
Prevention: Test with real document samples
```

**Pattern 5: Tasks rendering but not visible**
```
Root Cause: CSS issues (off-screen, z-index, overflow hidden)
Debug: Inspect element, check computed styles
Fix: Adjust layout CSS
Prevention: Test in browser DevTools at different screen sizes
```

## Debugging Checklist

Before claiming "it's fixed":

- [ ] Can you reproduce the original bug?
- [ ] Do you understand the root cause?
- [ ] Did you write a test that fails before the fix?
- [ ] Does the test pass after the fix?
- [ ] Did you check related code for similar issues?
- [ ] Did you verify edge cases?
- [ ] Did you check console/logs for new errors?
- [ ] Did you test the happy path still works?

## When Stuck

If you've been debugging for >30 minutes without progress:

1. **Take a break** (seriously, this helps)
2. **Explain it out loud** (rubber duck debugging)
3. **Start from scratch** - delete your changes and try again
4. **Check recent changes** - what broke it?
5. **Ask for help** - show your debugging steps

## Auto-Application Rules

This skill AUTOMATICALLY applies when:
- User reports a bug
- Error messages appear
- Tests are failing
- User says: "fix", "debug", "error", "not working", "broken"
- Stack traces or exceptions are mentioned

**Mandatory behavior:**
1. ALWAYS reproduce the bug first
2. NEVER make random edits hoping it fixes things
3. ALWAYS understand root cause before fixing
4. ALWAYS write a test that captures the bug
5. ALWAYS verify the fix doesn't break other things
