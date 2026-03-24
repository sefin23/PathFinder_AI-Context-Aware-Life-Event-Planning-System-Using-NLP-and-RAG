# Dynamic Document Intelligence - Implementation Plan

## Problem Statement
**User uploads offer letter → System should extract location/company → Provide state-specific portal links**

Currently: System shows generic links or placeholders
**Goal**: Intelligent, personalized guidance based on user's actual documents

---

## ✅ What's Already Working

1. **Vault Document Storage** (`backend/models/vault_model.py`)
   - `extracted_fields` JSON column stores parsed data
   - Fields like `company_name`, `work_location`, `pan_number`, etc.

2. **Field Resolution System** (`backend/routes/task_routes.py:299-311`)
   ```python
   vault_map = {}
   for d in vault_docs:
       if d.extracted_fields:
           vault_map.update(json.loads(d.extracted_fields))

   def resolve_field(source: str):
       if source == "vault.company_name":
           return vault_map.get("company_name")  # ✅ Works!
   ```

3. **Portal Registry** (`backend/services/portal_registry_service.py`)
   - Has state-specific URLs (e.g., Maharashtra PF portal vs Karnataka PF portal)
   - `get_portal_url_by_keyword(task, state_code)` function exists

---

## ❌ What's Missing

### 1. Vision Service Doesn't Extract Offer Letter Fields

**Current**: Vision service extracts basic fields (name, numbers)
**Needed**: Extract from offer letters:
- `company_name` (e.g., "Infosys Limited")
- `work_location` / `office_city` (e.g., "Pune", "Bangalore")
- `state` (e.g., "Maharashtra", "Karnataka")
- `joining_date`
- `designation`
- `salary` (for PF/ESI calculations)

**File to modify**: `backend/services/vision_service.py`

Add prompt template:
```python
OFFER_LETTER_PROMPT = """
Analyze this offer/appointment letter and extract:
1. company_name: Full legal name of employer
2. work_location: City where office is located
3. state: State name (full, not code)
4. joining_date: Date of joining (YYYY-MM-DD)
5. designation: Job title/role
6. salary_monthly: Monthly salary in numbers

Return as JSON only.
"""
```

### 2. State Code Mapping Not Used

**Current**: `state_code = (user.state_code or "").lower()` on line 288
**Problem**: User profile doesn't have state, offer letter does!

**Fix needed**:
```python
# Extract state from vault documents (offer letter, Aadhaar)
state_from_vault = None
for doc in vault_docs:
    if doc.extracted_fields:
        fields = json.loads(doc.extracted_fields)
        if 'state' in fields:
            state_from_vault = fields['state']
            break

# Convert state name to code
state_code = get_state_code(state_from_vault or user.state_code or "")
```

Need utility function:
```python
def get_state_code(state_name: str) -> str:
    STATE_MAP = {
        "maharashtra": "mh", "karnataka": "ka", "tamil nadu": "tn",
        "delhi": "dl", "haryana": "hr", "telangana": "ts",
        # ... all 28 states
    }
    return STATE_MAP.get(state_name.lower(), "")
```

### 3. Portal Registry Needs Expansion

**Current**: Portal registry has some government portals
**Needed**: State-specific variants for EVERY service

Example - PF Registration:
```json
{
    "epf_registration": {
        "default": "https://www.epfindia.gov.in/",
        "mh": "https://epfindia.gov.in/site_en/Regional_Offices.php?id=mumbai",
        "ka": "https://epfindia.gov.in/site_en/Regional_Offices.php?id=bangalore",
        "tn": "https://epfindia.gov.in/site_en/Regional_Offices.php?id=chennai"
    },
    "address_change_aadhaar": {
        "default": "https://ssup.uidai.gov.in/",
        "mh": "https://ssup.uidai.gov.in/web/guest/center?state=27",  # Maharashtra
        "dl": "https://ssup.uidai.gov.in/web/guest/center?state=7"   # Delhi
    }
}
```

### 4. Guide Generation Doesn't Use Location Context

**Current**: Generic steps like "Visit the portal"
**Needed**:
```
Step 2: Visit YOUR regional office
Description: Based on your offer letter (Pune office), your regional EPFO office is:
📍 EPFO Regional Office, Pune
   Address: Bhavani Shankar Road, Shivaji Nagar, Pune - 411005
   Phone: 020-25536881

🔗 Online Portal: https://epfindia.gov.in/...regional/pune
```

---

## 🎯 Implementation Priority

### Phase 1: Critical (Do Now) ✅
1. **Enhance Vision Service for Offer Letters**
   - Add document type detection (offer letter vs Aadhaar vs PAN)
   - Extract: company_name, work_location, state, joining_date
   - Store in `extracted_fields` JSON

2. **State Code Resolution**
   - Create `get_state_code()` utility
   - Update `task_routes.py` to check vault for state before user profile

3. **Portal Registry Expansion**
   - Add Maharashtra, Karnataka, Delhi, Bangalore variants
   - At minimum: PF, ESI, Aadhaar update, Voter ID, Driving License

### Phase 2: Important (Next)
1. **Dynamic Step Generation**
   - If state detected → show regional office address
   - If company_name detected → pre-fill in all forms
   - If joining_date detected → calculate PF enrollment deadline

2. **Multi-Document Intelligence**
   - Combine offer letter + Aadhaar → validate address mismatch
   - Offer letter + PAN → verify name consistency
   - Show warning if documents conflict

### Phase 3: Advanced (Future)
1. **Company Database Integration**
   - Auto-detect if company is in SEZ (tax benefits differ)
   - Show company-specific compliance (e.g., "Infosys uses Darwinbox - here's the link")

2. **Historical Intelligence**
   - "Users who moved to Bangalore typically need these 3 extra documents"
   - Time estimates: "PF transfer in Karnataka takes 45 days on average"

---

## 📊 Example User Flow

### Before (Current):
```
User uploads: offer_letter.pdf (Infosys, Pune office)
Guide shows: "Visit https://epfindia.gov.in" (generic)
Prefill shows: "Full Name: Required, Joining Date: Required"
```

### After (Goal):
```
User uploads: offer_letter.pdf (Infosys, Pune office)

System extracts:
- company_name: "Infosys Limited"
- work_location: "Pune"
- state: "Maharashtra"
- joining_date: "2024-04-15"

Guide shows:
✅ "Register with EPFO - Pune Regional Office"
📍 Address: Bhavani Shankar Road, Shivaji Nagar, Pune
🔗 Portal: https://epfindia.gov.in/regional/mumbai (State-specific!)

Prefill shows:
✅ Company Name: Infosys Limited (from vault - offer letter)
✅ Joining Date: 2024-04-15 (from vault - offer letter)
✅ Office Location: Pune, Maharashtra (from vault - offer letter)
✅ Aadhaar: 1234 5678 9012 (from vault - Aadhaar scan)

All pre-filled! User just clicks "Submit" →
```

---

## 🛠️ Code Changes Required

### File 1: `backend/services/vision_service.py`

Add after existing extraction logic:
```python
def extract_offer_letter_fields(image_base64: str) -> dict:
    """Extract structured data from offer/appointment letters."""

    prompt = """
    Analyze this employment document and extract these exact fields:

    1. company_name: Full registered company name (e.g., "Tata Consultancy Services Limited")
    2. work_location: Office city (e.g., "Bangalore", "Mumbai")
    3. state: Full state name (e.g., "Karnataka", "Maharashtra")
    4. joining_date: Format as YYYY-MM-DD
    5. designation: Job title
    6. salary_monthly: Monthly CTC in rupees (number only)
    7. employee_id: If mentioned

    Return ONLY valid JSON with these keys. If field not found, use null.
    """

    # Call Gemini Vision API
    response = gemini_vision_api(image_base64, prompt)
    return json.loads(response)
```

### File 2: `backend/routes/task_routes.py`

Replace line 288:
```python
# OLD:
state_code = (user.state_code or "").lower() if user else ""

# NEW:
state_code = get_user_state_code(user, vault_docs)
```

Add utility function:
```python
def get_user_state_code(user, vault_docs) -> str:
    """Get state code from vault documents (offer letter, Aadhaar) or user profile."""

    # Priority 1: Check vault documents
    for doc in vault_docs:
        if doc.extracted_fields:
            fields = json.loads(doc.extracted_fields)
            if 'state' in fields and fields['state']:
                return map_state_to_code(fields['state'])

    # Priority 2: User profile
    if user and user.state_code:
        return user.state_code.lower()

    return ""

def map_state_to_code(state_name: str) -> str:
    """Convert state name to 2-letter code."""
    states = {
        "andhra pradesh": "ap", "arunachal pradesh": "ar", "assam": "as",
        "bihar": "br", "chhattisgarh": "cg", "goa": "ga", "gujarat": "gj",
        "haryana": "hr", "himachal pradesh": "hp", "jharkhand": "jh",
        "karnataka": "ka", "kerala": "kl", "madhya pradesh": "mp",
        "maharashtra": "mh", "manipur": "mn", "meghalaya": "ml",
        "mizoram": "mz", "nagaland": "nl", "odisha": "or", "punjab": "pb",
        "rajasthan": "rj", "sikkim": "sk", "tamil nadu": "tn",
        "telangana": "ts", "tripura": "tr", "uttar pradesh": "up",
        "uttarakhand": "uk", "west bengal": "wb",
        "delhi": "dl", "puducherry": "py", "chandigarh": "ch"
    }
    return states.get(state_name.lower().strip(), "")
```

### File 3: `backend/services/portal_registry_service.py`

Expand registry with state variants:
```python
REGISTRY = {
    "epf_enrollment": {
        "keywords": ["pf", "provident fund", "epf", "employee provident"],
        "default_url": "https://www.epfindia.gov.in/site_en/Unified_Portal.php",
        "state_urls": {
            "mh": "https://epfindia.gov.in/site_en/Regional_Offices.php?id=mumbai",
            "ka": "https://epfindia.gov.in/site_en/Regional_Offices.php?id=bangalore",
            "tn": "https://epfindia.gov.in/site_en/Regional_Offices.php?id=chennai",
            "dl": "https://epfindia.gov.in/site_en/Regional_Offices.php?id=delhi"
        }
    },
    # Add 20+ more services...
}
```

---

## ✅ Success Metrics

When this is done, verify:
1. Upload offer letter → State auto-detected ✅
2. Click "Register for PF" → Shows Pune/Bangalore/Delhi specific link ✅
3. Prefill section → Shows company name, location, joining date ✅
4. No fake "pathfinder.gov.in" links ✅
5. Works for: Job relocation, Business (home state), Health (current location) ✅

---

## 📝 Notes for Implementation

- **Don't break existing functionality**: Add state-specific URLs as fallback, keep generic URLs as ultimate fallback
- **Handle missing data gracefully**: If state not detected, show generic portal + message "Upload your offer letter for location-specific guidance"
- **Test with real documents**: Infosys offer letter (Karnataka), TCS offer letter (Maharashtra), Government job (Delhi)
- **Privacy**: Never log/store document images, only extracted fields

---

**Status**: Ready for implementation
**Estimated effort**: 6-8 hours for Phase 1
**Business impact**: HIGH - This is the core differentiator vs generic task managers
