# Testing Guide - New Features

## 🚀 Quick Start

### Prerequisites
- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:5173`
- Database with seeded data

---

## ✅ Feature Testing Checklist

### 1. Phase Completion Celebrations

**Steps**:
1. Navigate to any life event journey (e.g., "First Job - Bengaluru")
2. Mark all tasks in one phase as complete (e.g., "Research" phase)
3. Check the last task in that phase

**Expected**:
- ✨ Confetti animation appears
- Green toast notification: "✨ Research Complete!"
- Animation only plays once per phase

**File**: [frontend-v2/src/pages/JourneyDetail.jsx:686-716](frontend-v2/src/pages/JourneyDetail.jsx#L686-L716)

---

### 2. Dependency Blocker Indicators

**Steps**:
1. Find a task with subtasks (e.g., "Define business plan" with 3 subtasks)
2. Don't complete the parent task
3. Look at the child tasks (subtasks)

**Expected**:
- 🔒 Red warning banner on blocked tasks
- Message: "BLOCKED BY DEPENDENCY"
- Shows parent task name: "Complete 'Define business plan' first"

**File**: [frontend-v2/src/components/JourneyTaskCard.jsx:232-255](frontend-v2/src/components/JourneyTaskCard.jsx#L232-L255)

---

### 3. Parallel Task Suggestions

**Steps**:
1. Have some tasks blocked (don't complete parent)
2. Have some tasks available (no dependencies or parent completed)
3. Scroll to top of journey page

**Expected**:
- Orange banner appears: "You have tasks waiting on others!"
- Shows top 3 available tasks by priority
- Numbered list (1, 2, 3)
- Click task → Scrolls to that task

**File**: [frontend-v2/src/components/ParallelTasksSuggestion.jsx](frontend-v2/src/components/ParallelTasksSuggestion.jsx)

---

### 4. Document Status Dashboard

**Steps**:
1. Navigate to any journey page
2. Look below the top navbar, above task list

**Expected**:
- 4 category progress bars:
  - Identity Documents (e.g., 2/2 ✓)
  - Financial Documents (e.g., 1/3)
  - Address Proof (e.g., 1/2)
  - Employment Records (e.g., 2/2 ✓)
- Green checkmark on completed categories
- "Add to Vault" button on incomplete categories

**File**: [frontend-v2/src/components/DocumentStatusDashboard.jsx](frontend-v2/src/components/DocumentStatusDashboard.jsx)

---

### 5. Cost Estimators Per Task

**Steps**:
1. Look at any task card in journey view
2. Find tasks with costs (e.g., "Set up finances", "Apply for passport")

**Expected**:
- Gold ₹ badge showing cost range
- Examples:
  - "Transfer PF" → ₹ 0 (Free)
  - "Open bank account" → ₹ 0-500
  - "Apply for passport" → ₹ 1500-5000

**Files**:
- Backend: [backend/scripts/seed_task_costs.py](backend/scripts/seed_task_costs.py)
- Frontend: [frontend-v2/src/components/JourneyTaskCard.jsx:194-216](frontend-v2/src/components/JourneyTaskCard.jsx#L194-L216)

---

### 6. Dynamic Document Intelligence (MOST IMPORTANT)

#### 6.1 Upload Test Document

**Steps**:
1. Go to Vault page
2. Upload a test offer letter (or create a text file with):
   ```
   OFFER LETTER

   Company: Infosys Limited
   Position: Software Engineer
   Location: Pune, Maharashtra
   Joining Date: 15 May 2026
   Salary: ₹8,00,000 per annum
   ```
3. Wait for processing (Vision AI extraction)

**Expected**:
- ✓ Document uploaded successfully
- ✓ Extracted fields shown in document card
- ✓ Company Name: Infosys Limited
- ✓ Work Location: Pune, Maharashtra
- ✓ State: Maharashtra (MH)

---

#### 6.2 State Detection Test

**Backend Test**:
```bash
cd c:\Users\sefin\OneDrive\Desktop\Pathfinder_AI
python test_dynamic_intelligence.py
```

**Expected Output**:
```
TEST 1: Location Detection & State Mapping
  Pune         → Maharashtra → MH  ✅
  Bangalore    → Karnataka   → KA  ✅
  Mumbai       → Maharashtra → MH  ✅
  Chennai      → Tamil Nadu  → TN  ✅
```

**Files**:
- [backend/services/vision_service.py:156-218](backend/services/vision_service.py#L156-L218)
- [test_dynamic_intelligence.py](test_dynamic_intelligence.py)

---

#### 6.3 Regional Office in Guide Test

**Steps**:
1. After uploading offer letter (with Pune location)
2. Navigate to a job relocation journey
3. Find task: "Transfer PF to new employer"
4. Click "Guide me through this"

**Expected**:
- Guide panel opens
- Step 2 shows:
  ```
  Visit the official portal

  📍 Your regional EPFO office: EPFO Regional Office - Mumbai
  Address: 3rd Floor, ICICI Bank Towers, Bandra-Kurla Complex,
           Mumbai - 400051
  Phone: 022-26528941

  You may need to visit this office for biometric verification
  or document submission.

  [Open Portal] → https://unifiedportal-emp.epfindia.gov.in/
  ```

**Files**:
- [backend/routes/task_routes.py:401-436](backend/routes/task_routes.py#L401-L436)
- [backend/data/portal_registry.json:288-357](backend/data/portal_registry.json#L288-L357)

---

#### 6.4 Context-Aware Prefills Test

**Steps**:
1. Same journey as above (after uploading offer letter)
2. Click "Guide me through this" on PF transfer task
3. Scroll to "Pre-filled Information" section

**Expected**:
- ✓ Company Name: Infosys Limited (from offer letter)
- ✓ Work Location: Pune, Maharashtra (from offer letter)
- ✓ Joining Date: 15 May 2026 (from offer letter)
- ✓ Current Address: [If Aadhaar uploaded, shows that address]

**Test Different Task Types**:

**Financial Task** (e.g., "Open bank account"):
- ✓ PAN Number
- ✓ Aadhaar Number
- ✓ Date of Birth
- ✓ Mobile Number

**Business Task** (e.g., "Register business name"):
- ✓ Business Name
- ✓ PAN Number
- ✓ Business Address

**File**: [backend/routes/task_routes.py:437-492](backend/routes/task_routes.py#L437-L492)

---

#### 6.5 No Fake URLs Test

**Steps**:
1. Find a task without uploaded documents
2. Click "Guide me through this"
3. Look at portal link section

**Expected**:
- Either shows real URL (e.g., `https://uidai.gov.in`)
- Or shows note: "📄 Upload required documents to your Vault for personalized portal links"
- **NEVER** shows fake "pathfinder.gov.in" URL

**File**: [backend/routes/task_routes.py:374-375](backend/routes/task_routes.py#L374-L375)

---

## 🧪 Automated Tests

### Backend Tests
```bash
# Test 1: Portal Registry Load
python -c "from backend.services.portal_registry_service import registry; print('✓ Registry loaded')"

# Test 2: Regional Office Lookup
python -c "from backend.services.portal_registry_service import registry; info = registry.get_regional_office('epfo', 'mh'); print(f'✓ {info[\"name\"]}')"

# Test 3: State Detection
python -c "from backend.services.vision_service import extract_state_from_locations, map_state_to_code; state = extract_state_from_locations(['Pune']); code = map_state_to_code(state); print(f'✓ Pune → {state} → {code.upper()}')"

# Test 4: Full E2E
python test_dynamic_intelligence.py
```

### Frontend Tests
```bash
cd frontend-v2

# Test build
npm run build

# Expected: ✓ built in ~800ms
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Regional office not showing in guide
**Cause**: State not detected from document
**Solution**:
- Check if city is in the 30+ supported cities (see vision_service.py line 161-195)
- Manually add city to `city_to_state` dict if missing

### Issue 2: Confetti not appearing
**Cause**: Phase already celebrated before
**Solution**:
- Celebration only fires once per phase per session
- Refresh page to reset celebration state
- Or mark a different phase complete

### Issue 3: Cost badges not showing
**Cause**: Tasks not seeded with costs
**Solution**:
```bash
cd backend
python scripts/seed_task_costs.py
```

### Issue 4: Document extraction fails
**Cause**: Gemini API quota exhausted
**Solution**:
- Vision service falls back to basic text extraction
- Wait 60 seconds for quota refresh
- Or use static test data

---

## 📊 Test Data

### Sample Offer Letter (for testing)
```
OFFER OF EMPLOYMENT

Dear Candidate,

We are pleased to offer you the position of Software Engineer at Infosys Limited.

Position: Software Engineer
Department: Technology Services
Location: Pune, Maharashtra
Joining Date: 15th May 2026
Annual CTC: ₹8,00,000

Please report to our Pune office located at:
Infosys SEZ, Rajiv Gandhi Infotech Park, Hinjewadi Phase 1, Pune - 411057

Your Reporting Manager: John Doe
Employee ID will be assigned on joining date.

This offer is contingent upon successful completion of background verification.

Sincerely,
HR Department
Infosys Limited
```

### Expected Extraction from Above:
- ✓ Company Name: Infosys Limited
- ✓ Work Location: Pune, Maharashtra
- ✓ State: Maharashtra
- ✓ State Code: MH
- ✓ Joining Date: 15 May 2026
- ✓ Position: Software Engineer

---

## 🎯 Success Criteria

All tests pass if:

1. ✅ Confetti appears on phase completion
2. ✅ Blocked tasks show red lock banner
3. ✅ Parallel suggestions appear when applicable
4. ✅ Document progress bars display correctly
5. ✅ Cost badges show on tasks
6. ✅ State detected from "Pune" → "Maharashtra (MH)"
7. ✅ Regional office shown: "EPFO Regional Office - Mumbai"
8. ✅ Prefills show: Company, Location, Joining Date
9. ✅ No fake "pathfinder.gov.in" URLs
10. ✅ Frontend builds without errors

---

## 📞 Need Help?

- Technical details: [docs/dynamic-intelligence-completed.md](docs/dynamic-intelligence-completed.md)
- User experience: [docs/user-facing-changes.md](docs/user-facing-changes.md)
- Run tests: [test_dynamic_intelligence.py](test_dynamic_intelligence.py)

---

**Last Updated**: March 19, 2026
**Test Status**: All automated tests passing ✅
