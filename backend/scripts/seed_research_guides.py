
import sqlite3
import json

def seed_expert_guides():
    conn = sqlite3.connect('backend/sql_app.db')
    cursor = conn.cursor()
    
    # 1. Create table if not exists (though it should already be there)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS task_guides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_type TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        estimated_mins INTEGER,
        url TEXT,
        steps TEXT, -- JSON array
        prefill_fields TEXT, -- JSON array
        required_doc_types TEXT, -- JSON array
        expected_result TEXT,
        what_to_save TEXT,
        tags TEXT -- JSON array
    )
    """)
    
    # 2. Expert Guides from "Correction Brief"
    guides = [
        {
            "task_type": "download_aadhaar",
            "title": "Download your e-Aadhaar",
            "estimated_mins": 5,
            "url": "https://myaadhaar.uidai.gov.in",
            "prefill_fields": [
                {"label": "Aadhaar number", "source": "vault.aadhaar_number"},
                {"label": "Registered mobile", "source": "profile.mobile"},
                {"label": "Full name", "source": "profile.full_name"}
            ],
            "steps": [
                {
                    "num": 1, "title": "Go to the official UIDAI page", 
                    "description": "Open myaadhaar.uidai.gov.in — make sure it's the .gov.in domain. Do not use third-party sites.",
                    "action": {"type": "link", "label": "Open UIDAI page →", "url": "https://myaadhaar.uidai.gov.in"}
                },
                {
                    "num": 2, "title": "Enter your Aadhaar number", 
                    "description": "Enter the 12-digit number. Your Aadhaar number from your vault is shown above — just copy it in.",
                    "action": {"type": "copy", "label": "Copy number", "source": "vault.aadhaar_number"}
                },
                {
                    "num": 3, "title": "Enter the OTP sent to your phone", 
                    "description": "An SMS will arrive on your registered mobile. Enter the 6-digit code. If you do not receive it within 2 minutes, click Resend OTP.",
                    "action": None
                },
                {
                    "num": 4, "title": "Download the PDF and enter the password", 
                    "description": "Click Download Aadhaar. The PDF is password-protected. Password = first 4 letters of your name (uppercase) + birth year.",
                    "action": {"type": "copy", "label": "Copy password hint"}
                }
            ],
            "required_doc_types": ["aadhaar_card"],
            "expected_result": "A PDF named eaadhaar.pdf will download. Open it with your password.",
            "what_to_save": "Rename it Aadhaar_2026.pdf and save to your Documents folder. You will need this in multiple steps.",
            "tags": ["critical", "identity"]
        },
        {
            "task_type": "submit_hr_docs",
            "title": "Submit your documents to HR",
            "estimated_mins": 15,
            "url": "https://portal.infosys.com",
            "prefill_fields": [
                {"label": "Full Name", "source": "profile.full_name"},
                {"label": "Joining Date", "source": "profile.joining_date"}
            ],
            "steps": [
                {
                    "num": 1, "title": "Gather the required documents", 
                    "description": "You need: Aadhaar (from vault ✓), PAN card (from vault ✓), Offer letter, Degree certificate, and 3 salary slips.",
                    "action": None
                },
                {
                    "num": 2, "title": "Check your offer letter for submission method", 
                    "description": "Some companies use an HR portal (like Infosys). Others ask for physical copies on Day 1. Check the last page of your offer letter.",
                    "action": None
                },
                {
                    "num": 3, "title": "Submit or upload all documents", 
                    "description": "If via portal: upload each file. If physical: arrange them in a folder labelled with your name and joining date.",
                    "action": {"type": "link", "label": "Open HR Portal", "url": "https://portal.infosys.com"}
                }
            ],
            "required_doc_types": ["aadhaar_card", "pan_card", "offer_letter", "degree_certificate"],
            "expected_result": "HR will initiate your BGV (background verification) after receiving documents.",
            "what_to_save": "Save the submission acknowledgement receipt or confirmation email.",
            "tags": ["high", "onboarding"]
        },
        {
            "task_type": "open_salary_account",
            "title": "Open your salary bank account",
            "estimated_mins": 25,
            "url": "https://www.hdfcbank.com",
            "prefill_fields": [
                {"label": "Full Name", "source": "profile.full_name"},
                {"label": "Aadhaar number", "source": "vault.aadhaar_number"},
                {"label": "Office Address", "source": "profile.office_address"}
            ],
            "steps": [
                {
                    "num": 1, "title": "Find the nearest branch of your employer bank", 
                    "description": "Your offer letter specifies which bank (usually HDFC or ICICI for Infosys). Branches near your office are recommended.",
                    "action": {"type": "link", "label": "Find branch →", "url": "https://www.hdfcbank.com/branch-locator"}
                },
                {
                    "num": 2, "title": "Carry your Aadhaar and offer letter", 
                    "description": "These are the two mandatory documents for a salary account. Both are in your vault.",
                    "action": None
                },
                {
                    "num": 3, "title": "Tell the bank it is a salary account for Infosys", 
                    "description": "They will have a corporate account opening process. It is usually faster than a regular account.",
                    "action": None
                }
            ],
            "required_doc_types": ["aadhaar_card", "offer_letter"],
            "expected_result": "You will receive a welcome kit with your account number and debit card.",
            "what_to_save": "The account confirmation kit and debit card receipt.",
            "tags": ["medium", "finance"]
        }
    ]
    
    for g in guides:
        cursor.execute("""
            INSERT OR REPLACE INTO task_guides 
            (task_type, title, estimated_mins, url, steps, prefill_fields, required_doc_types, expected_result, what_to_save, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            g["task_type"], g["title"], g["estimated_mins"], g["url"], 
            json.dumps(g["steps"]), json.dumps(g["prefill_fields"]), 
            json.dumps(g["required_doc_types"]), g["expected_result"], 
            g["what_to_save"], json.dumps(g["tags"])
        ))
        
    conn.commit()
    print(f"Seeded {len(guides)} expert guides.")
    
    # 3. Backfill tasks to match these guides based on title keywords
    cursor.execute("UPDATE tasks SET guide_type = 'download_aadhaar' WHERE title LIKE '%Aadhaar%'")
    cursor.execute("UPDATE tasks SET guide_type = 'submit_hr_docs' WHERE title LIKE '%HR%' OR title LIKE '%Submit Document%'")
    cursor.execute("UPDATE tasks SET guide_type = 'open_salary_account' WHERE title LIKE '%Bank%' OR title LIKE '%Salary Account%'")
    
    conn.commit()
    print("Backfilled existing tasks with guide_type.")
    conn.close()

if __name__ == "__main__":
    seed_expert_guides()
