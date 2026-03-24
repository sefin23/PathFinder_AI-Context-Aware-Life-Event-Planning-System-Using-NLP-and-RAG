import json
import sys
from pathlib import Path
from sqlalchemy.orm import Session

sys.path.append(str(Path(__file__).parent.parent.parent))

from backend.database import SessionLocal
from backend.models.vault_model import VaultDocument
from backend.services.vault_integration_service import process_vault_extraction

TEMPLATES = {
    "1": {
        "name": "Identity: Aadhaar Card (Clean)",
        "category": "identity",
        "suggested_name": "Aadhaar Card.pdf",
        "result": {
            "category": "identity",
            "suggested_name": "Aadhaar Card",
            "full_name": "Sefin Jose",
            "father_name": "Sebastian Joseph",
            "dob": "1998-05-12",
            "gender": "Male",
            "address_city": "Kochi",
            "permanent_address": "Flat 4B, Skyview, Kochi, Kerala",
            "id_last4": "5521",
            "confidence": 0.98
        }
    },
    "2": {
        "name": "Employment: Infosys Offer Letter (Bengaluru)",
        "category": "employment",
        "suggested_name": "Infosys_Offer_Letter.pdf",
        "result": {
            "category": "employment",
            "suggested_name": "Offer Letter - Infosys",
            "company_name": "Infosys Limited",
            "joining_date": "2026-04-15",
            "office_city": "Bengaluru",
            "role_title": "Senior Systems Engineer",
            "employee_id": "INFY772911",
            "uan_number": "100992288331",
            "notice_period_days": 90,
            "confidence": 0.95
        }
    },
    "3": {
        "name": "Identity: PAN Card",
        "category": "identity",
        "suggested_name": "PAN_Card.png",
        "result": {
            "category": "identity",
            "suggested_name": "PAN Card",
            "full_name": "SEFIN JOSE",
            "dob": "1998-05-12",
            "pan_number": "ABCPS7721J",
            "id_last4": "7721J",
            "confidence": 0.99
        }
    },
    "4": {
        "name": "Financial: HDFC Bank Statement",
        "category": "financial",
        "suggested_name": "HDFC_Statement_March.pdf",
        "result": {
            "category": "financial",
            "suggested_name": "HDFC Statement - March 2026",
            "bank_name": "HDFC Bank",
            "account_last4": "4221",
            "confidence": 0.92
        }
    }
}

def simulate():
    db = SessionLocal()
    try:
        docs = db.query(VaultDocument).filter(VaultDocument.deleted_at == None).all()
        if not docs:
            print("❌ No documents found in your vault. Upload something first (even a blank file)!")
            return

        print("\n--- 🧠 JET-STREAM EXTRACTION SIMULATOR ---")
        print("Select a document to simulate AI extraction on:")
        for i, d in enumerate(docs):
            print(f"[{i+1}] ID: {d.id} | Name: {d.name} | Type: {d.doc_type}")
        
        choice = input("\nEnter number (or 'q' to quit): ")
        if choice.lower() == 'q': return
        doc = docs[int(choice)-1]

        print("\nSelect an Intelligence Template to apply:")
        for k, v in TEMPLATES.items():
            print(f"[{k}] {v['name']}")
        
        t_choice = input("\nEnter choice: ")
        template = TEMPLATES.get(t_choice)
        if not template: return

        print(f"\n🚀 Simulating Gemini Vision for {doc.name}...")
        
        # 1. Inject the "Result" into the database as if Gemini returns it
        doc.extracted_fields = json.dumps(template["result"])
        doc.doc_type = template["result"]["category"]
        
        # Keep original extension
        ext = doc.name.split('.')[-1] if '.' in doc.name else ''
        new_name = template["result"]["suggested_name"]
        if ext and not new_name.endswith(f".{ext}"):
            new_name += f".{ext}"
        doc.name = new_name
        
        db.commit()

        # 2. Trigger side effects manually
        print(f"Applying side-effects (date shifting, mismatch checks)...")
        from backend.services.vault_integration_service import _check_address_mismatch, _recalculate_plan_deadlines
        from backend.models.user_model import User
        
        user = db.query(User).filter(User.id == doc.user_id).first()
        profile_data = json.loads(user.extracted_profile) if user.extracted_profile else {}
        
        res = template["result"]
        if res["category"] == "identity":
             if res.get("address_city"): profile_data["current_city"] = res["address_city"]
             if res.get("full_name"): profile_data["full_name"] = res["full_name"]
        elif res["category"] == "employment":
             if res.get("office_city"): profile_data["job_city"] = res["office_city"]
             if res.get("joining_date"): 
                 profile_data["joining_date"] = res["joining_date"]
                 _recalculate_plan_deadlines(db, user.id, res["joining_date"])
        
        user.extracted_profile = json.dumps(profile_data)
        db.commit()
        
        _check_address_mismatch(db, user.id)
        
        print("\n✅ Simulation Complete!")
        print(f"Document updated: {doc.name}")
        print(f"Profile updated: {json.dumps(profile_data, indent=2)}")
        print("Go to your Dashboard now to see the Alerts and Date Shifts!")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    simulate()
