# User-Facing Changes Summary

## What the User Will See

### 1. Upload Offer Letter → Automatic Location Detection

**User Action**: Upload offer letter PDF to Vault

**System Response**:
```
✓ Document uploaded successfully
✓ Extracted: Company Name, Work Location, Joining Date
✓ Detected location: Pune, Maharashtra
```

---

### 2. View Task Guide → Location-Specific Instructions

**Before**:
```
Transfer PF to new employer

Steps:
1. Gather documents
2. Visit EPFO portal [Generic link]
3. Follow instructions
```

**After** (with uploaded offer letter):
```
Transfer PF to new employer

Steps:
1. Gather documents: PAN, Aadhaar, Previous PF number

2. Visit EPFO portal

   📍 Your regional office: EPFO Regional Office - Mumbai
   Address: 3rd Floor, ICICI Bank Towers,
            Bandra-Kurla Complex, Mumbai - 400051
   Phone: 022-26528941

   You may need to visit this office for biometric
   verification or document submission.

3. Follow instructions and save acknowledgement
```

---

### 3. Task Prefills → More Context-Aware Fields

**Before**:
```
Pre-filled Information:
- Full Name: John Doe
- Joining Date: Not found
```

**After** (with uploaded documents):
```
Pre-filled Information:
✓ Company Name: Infosys Limited
✓ Work Location: Pune, Maharashtra
✓ Joining Date: 15 May 2026
✓ Current Address: [From Aadhaar]
```

---

### 4. No More Fake URLs

**Before**:
```
Steps:
2. Visit portal → https://pathfinder.gov.in [FAKE]
```

**After**:
```
Steps:
2. Visit portal → https://unifiedportal-emp.epfindia.gov.in/ [REAL]

Or if no real URL available:
📄 Upload required documents to your Vault for personalized portal links
```

---

### 5. Smart Document Intelligence Examples

#### Example 1: Job Relocation to Bangalore
**Uploaded**: Offer letter from "TCS, Bangalore"

**System Shows**:
- EPFO Regional Office - Bangalore (Koramangala address)
- Karnataka state-specific portals (Seva Sindhu)
- Prefills: TCS, Bangalore, Joining date

#### Example 2: Job Relocation to Mumbai
**Uploaded**: Offer letter from "HDFC Bank, Mumbai"

**System Shows**:
- EPFO Regional Office - Mumbai (Bandra-Kurla address)
- Maharashtra state-specific portals (Aaple Sarkar)
- Prefills: HDFC Bank, Mumbai, Joining date

#### Example 3: Job Relocation to Chennai
**Uploaded**: Offer letter from "Cognizant, Chennai"

**System Shows**:
- EPFO Regional Office - Chennai (DPI Campus address)
- Tamil Nadu state-specific portals (TNeGA e-Sevai)
- Prefills: Cognizant, Chennai, Joining date

---

## Coverage Summary

### Supported Cities (30+)
- **Maharashtra**: Mumbai, Pune, Nashik, Nagpur
- **Karnataka**: Bangalore, Bengaluru, Mysuru, Mangalore
- **Tamil Nadu**: Chennai, Coimbatore, Madurai
- **Telangana**: Hyderabad, Secunderabad
- **Haryana**: Gurgaon, Gurugram, Faridabad
- **Delhi**: Delhi, New Delhi
- And 15+ more major cities

### Supported States (All 36)
✅ All 28 states + 8 Union Territories covered

### Regional Offices Available
- **EPFO**: 5 states (MH, KA, TN, DL, HR)
- **ESIC**: 5 states (MH, KA, TN, DL, HR)
- **More coming**: Remaining 23 states in Phase 2

---

## What Happens If...

### User uploads no documents?
```
Guide shows:
📄 Upload required documents to your Vault for personalized portal links

Prefills show:
- Full Name: [From profile]
- Other fields: "Not found - upload documents"
```

### User uploads document without location?
```
System falls back to user's profile state
If profile state also missing → Shows national portals only
```

### User's city is not in the 30+ list?
```
System still extracts state name from document text
Example: "Raipur, Chhattisgarh" → Detects Chhattisgarh (CG)
Shows national portals + state portals (if available)
```

### Task is not EPFO/ESIC related?
```
Shows appropriate portal for that task type:
- Aadhaar → UIDAI portal
- PAN → NSDL/Protean portal
- Driving License → Parivahan portal
- State-specific → Seva Sindhu/Aaple Sarkar/etc.
```

---

## Visual Indicators

### Document Status Dashboard
Shows which documents are uploaded:
```
Identity Documents    [==============] 2/2 ✓
Financial Documents   [==========    ] 1/3
Address Proof         [======        ] 1/2
Employment Records    [==============] 2/2 ✓
```

### Smart Alerts
When documents conflict:
```
⚠️ PATHFINDER INSIGHT - LOGISTICS ALERT

Detected data mismatch: Aadhaar shows "Delhi" but
offer letter shows "Pune"

Action: Update Aadhaar address before joining
```

### Cost Estimators
Each task shows estimated cost:
```
Transfer PF to new employer
₹ 0 (Free)  ← NEW badge

Open bank account in new city
₹ 0-500     ← NEW badge

Apply for domicile certificate
₹ 100-300   ← NEW badge
```

---

## User Workflow Example

### Complete Journey: Relocating from Delhi to Pune for New Job

1. **User creates event**: "First job - Joining Infosys Pune"

2. **System generates tasks**:
   - Transfer PF to new employer
   - Open bank account in Pune
   - Update Aadhaar address
   - Apply for domicile certificate (if needed)
   - Set up local SIM card
   - ... 15 more tasks

3. **User uploads documents**:
   - Offer letter (PDF)
   - Old Aadhaar card (image)
   - PAN card (image)

4. **System extracts automatically**:
   ✓ Company: Infosys Limited
   ✓ Location: Pune, Maharashtra (MH)
   ✓ State detected: MH
   ✓ Joining: 15 May 2026
   ✓ PAN: ABCDE1234F
   ✓ Aadhaar: 1234-5678-9012

5. **User clicks "Transfer PF" task → "Guide me"**:

   System shows:
   ```
   📍 Your regional office: EPFO Regional Office - Mumbai
   Address: Bandra-Kurla Complex, Mumbai - 400051
   Phone: 022-26528941

   Pre-filled for you:
   ✓ Company Name: Infosys Limited
   ✓ New City: Pune, Maharashtra
   ✓ Joining Date: 15 May 2026
   ✓ Previous PF Number: [Enter if you have]

   Portal: https://unifiedportal-emp.epfindia.gov.in/
   ```

6. **User clicks "Update Aadhaar Address" → "Guide me"**:

   System shows:
   ```
   📍 Nearest Aadhaar center: [Based on Pune location]

   Pre-filled for you:
   ✓ Current Address: Delhi (from old Aadhaar)
   ✓ New Address: Pune, Maharashtra (from offer letter)
   ✓ Document proof: Offer letter available in Vault

   Portal: https://uidai.gov.in/
   ```

7. **System tracks progress**:
   ```
   Journey Progress: 4/20 tasks complete

   ✓ Upload documents        [Done]
   ✓ Research neighborhoods  [Done]
   ✓ Book travel             [Done]
   ✓ Notify current landlord [Done]
   ⏳ Transfer PF             [In Progress - Regional office info shown]
   ⏳ Open bank account       [Blocked - Need PF transfer first]
   ```

---

## Technical Details (For Reference)

### API Changes
- `GET /api/tasks/{task_id}/guide` now returns:
  - `url`: Real portal URL or null (no more fakes)
  - `url_note`: Explanation if URL is null
  - `prefilled`: Dynamic fields based on task context
  - `steps[].description`: May include regional office info

### Database Changes
- Tasks table: Added `estimated_cost_min`, `estimated_cost_max`, `cost_currency`
- Vault documents: `extracted_data` contains normalized fields

### AI Models Used
- Vision: Gemini 2.0 Flash (for document extraction)
- Text: Llama 3.2 90B (for guide generation when quota available)

---

**Last Updated**: March 19, 2026
