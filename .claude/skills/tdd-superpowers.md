# TDD Superpowers Skill

**Auto-applies when:** Creating new features, fixing bugs, or modifying core logic.

## The TDD Workflow (Strict Mode)

### Phase 1: UNDERSTAND
1. Ask clarifying questions before writing ANY code
2. Identify the root cause (for bugs) or requirements (for features)
3. Create a mini-spec with examples

**Template:**
```
## Goal: [What we're building/fixing]

## Current Behavior:
[What happens now]

## Expected Behavior:
[What should happen]

## Test Cases:
1. Happy path: [describe]
2. Edge case 1: [describe]
3. Edge case 2: [describe]
```

### Phase 2: TEST FIRST
Write failing tests BEFORE any implementation code.

**Rules:**
- ❌ Delete any production code written before tests exist
- ✓ Tests must fail initially (proving they test something real)
- ✓ Cover at least: 1 happy path + 2 edge cases

### Phase 3: IMPLEMENT
Write minimal code to make tests pass.

**Rules:**
- Only write code that makes a failing test pass
- No "extra features" or "nice-to-haves"
- Keep it simple (YAGNI - You Aren't Gonna Need It)

### Phase 4: REFACTOR
Clean up code while keeping tests green.

**Rules:**
- Run tests after every change
- Improve naming, extract functions, remove duplication
- Never change behavior during refactoring

### Phase 5: REVIEW
Self-review before marking complete.

**Checklist:**
- [ ] All tests pass
- [ ] Edge cases covered
- [ ] No hardcoded values (use registry/config)
- [ ] Error handling present
- [ ] Code is readable

## Example: Adding a New Portal

### ❌ Wrong Way (Code First)
```python
# Just adding code without tests
def get_portal_for_task(task_type, state):
    if state == "TN":
        return {"url": "https://tnportal.gov.in"}
```

### ✅ Right Way (TDD)

**Step 1: Write failing test**
```python
def test_get_tamil_nadu_portal_for_voter_id():
    portal = get_portal_for_task("voter_id", "TN", "Chennai")

    assert portal["name"] == "Tamil Nadu e-Services"
    assert "tnportal.gov.in" in portal["url"]
```

**Step 2: Run test (should fail)**
```bash
pytest backend/tests/test_portal_registry_service.py::test_get_tamil_nadu_portal_for_voter_id
# FAILED - returns None
```

**Step 3: Update portal_registry.json**
```json
{
  "TN": {
    "voter_id": {
      "portal_name": "Tamil Nadu e-Services",
      "url": "https://tnportal.gov.in/voter"
    }
  }
}
```

**Step 4: Implement helper (minimal code)**
```python
def get_portal_for_task(task_type, state, city=None):
    registry = load_portal_registry()
    return registry.get(state, {}).get(task_type)
```

**Step 5: Run test (should pass)**
```bash
pytest backend/tests/test_portal_registry_service.py::test_get_tamil_nadu_portal_for_voter_id
# PASSED ✓
```

## Pathfinder-Specific Rules

### When working with Portal Registry:
1. Test FIRST that task_type exists in registry
2. Test SECOND that state/city mapping works
3. THEN implement the lookup logic

### When working with URN Extraction:
1. Test with 3 real examples (Aadhaar, PAN, EPFO text)
2. Test Gemini failure → regex fallback
3. Test invalid input → returns None

### When working with Task Timelines:
1. Test timeline_buffers from registry
2. Test date calculations (initial_days, follow_up_days)
3. Test with different task types

### When working with Workflow Generation:
1. Test that proposed workflow has correct tasks
2. Test that approval creates tasks in database
3. Test that subtasks link to parent tasks

## Multi-Step Feature Development

For complex features (e.g., "Add Gujarat state support"):

**Step 1: Plan** (5 min)
- List all affected files
- Identify test files needed
- Create test cases list

**Step 2: Registry** (10 min)
- Update portal_registry.json
- Add Gujarat portals, timelines, URN patterns

**Step 3: Tests** (20 min)
- Write tests for each portal lookup
- Write tests for Gujarat-specific task types
- Write tests for edge cases

**Step 4: Implement** (15 min)
- No changes needed if registry + helpers already work
- Or add minimal code to support new patterns

**Step 5: E2E Test** (10 min)
- Test full flow: "Relocating to Ahmedabad"
- Verify tasks generated with correct portals

## Debugging Protocol

When something breaks:

1. **Reproduce with a test**
   ```python
   def test_bug_domicile_wrong_portal():
       """Bug: Bangalore domicile showing wrong portal"""
       task = create_task("domicile_certificate", state="KA", city="Bengaluru")
       portal = get_portal_for_task(task.task_type, task.state_code, task.job_city)

       assert portal["url"] == "https://sevasindhu.karnataka.gov.in"  # This fails
   ```

2. **Explain root cause**
   - Don't just patch symptoms
   - Find WHY it's broken (wrong config? logic error?)

3. **Fix at the source**
   - Update registry if config issue
   - Update logic if code issue
   - Keep test for regression prevention

## Auto-Application Rules

This skill AUTOMATICALLY applies when:
- Creating new backend/frontend features
- Fixing bugs
- Modifying services, routes, or critical logic
- User says "add", "implement", "fix", "create"

**Mandatory behavior:** Before ANY code implementation, show the test cases and ask for approval.
