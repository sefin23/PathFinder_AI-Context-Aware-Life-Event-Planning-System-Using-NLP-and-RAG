# Backend Tests Skill

**Auto-applies when:** Working with backend code, API endpoints, services, models, or database logic.

## Core Principles

1. **Test-First Development**
   - Write failing tests BEFORE implementing features
   - No production code without corresponding tests
   - Minimum coverage: 1 happy path + 1 edge case per function

2. **Test Structure (AAA Pattern)**
   ```python
   def test_feature_name():
       # ARRANGE - Set up test data and mocks
       mock_data = {...}

       # ACT - Execute the function under test
       result = function_under_test(mock_data)

       # ASSERT - Verify expected behavior
       assert result.success == True
       assert result.data == expected_data
   ```

3. **Backend Testing Hierarchy**
   - **Unit Tests**: Individual functions (services, helpers)
   - **Integration Tests**: Database + service layer
   - **API Tests**: Full endpoint request/response

## Required Patterns

### For Portal Registry Service
```python
# backend/tests/test_portal_registry_service.py
import pytest
from backend.services.portal_registry_service import get_portal_for_task

def test_get_portal_for_bangalore_domicile():
    """Verify Seva Sindhu portal for KA domicile"""
    portal = get_portal_for_task("domicile_certificate", "KA", "Bengaluru")

    assert portal is not None
    assert portal["name"] == "Seva Sindhu"
    assert "sevasindhu.karnataka.gov.in" in portal["url"]

def test_get_portal_for_unknown_state_returns_none():
    """Edge case: unknown state should return None"""
    portal = get_portal_for_task("domicile_certificate", "XX", "Unknown")
    assert portal is None
```

### For URN Extraction
```python
def test_extract_urn_from_aadhaar_acknowledgement():
    """Test URN extraction from real Aadhaar text"""
    sample_text = "Enrolment ID: 1234/56789/01234 dated 22/03/2026"

    urn = extract_urn_from_receipt(sample_text, "aadhaar_enrollment")

    assert urn == "1234/56789/01234"

def test_extract_urn_fallback_when_gemini_fails():
    """Verify regex fallback when Gemini extraction fails"""
    # Test fallback logic
    pass
```

### For Task Timeline Calculations
```python
def test_calculate_task_timeline_for_domicile():
    """Verify timeline buffers applied correctly"""
    task = create_test_task("domicile_certificate", state="KA")

    timeline = get_timeline(task.task_type)

    assert timeline.initial_days == 7
    assert timeline.follow_up_days == 14
```

## Workflow

1. **Before touching backend code:**
   ```
   ✓ Read existing tests
   ✓ Write new failing test
   ✓ Run tests (should fail)
   ✓ Implement feature
   ✓ Run tests (should pass)
   ✓ Refactor if needed
   ```

2. **Test file naming:**
   - `backend/tests/test_[module_name].py`
   - Example: `test_portal_registry_service.py`

3. **Mock external dependencies:**
   ```python
   @pytest.fixture
   def mock_gemini_api():
       with patch('backend.services.openrouter_client.call_llm') as mock:
           mock.return_value = {"reference_id": "ABC123"}
           yield mock
   ```

## What to Test in Pathfinder AI

### Critical Backend Paths
- ✓ Portal registry lookups (state + city + task_type)
- ✓ URN extraction (Gemini + regex fallback)
- ✓ Task timeline calculations
- ✓ State/city mapping logic
- ✓ Prerequisite resolution
- ✓ Workflow generation (task creation from life events)
- ✓ Task approval service
- ✓ Document collection status

### Edge Cases to Cover
- Unknown states/cities
- Missing task_type in registry
- Gemini API failures
- Invalid URN formats
- Null/empty user inputs
- Database constraint violations

## Commands

Run tests:
```bash
pytest backend/tests/ -v
pytest backend/tests/test_portal_registry_service.py -v
pytest backend/tests/ --cov=backend --cov-report=term
```

## Auto-Application Rules

This skill AUTOMATICALLY applies when:
- Editing files in `backend/services/`
- Editing files in `backend/routes/`
- Creating new backend features
- Fixing backend bugs
- Working with portal_registry_service, workflow_generation_service, urn extraction, etc.

**Mandatory behavior:** Ask "Should I write the test first?" before implementing any backend logic.
