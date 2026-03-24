"""
Add helpful descriptions to subtasks that are missing them.
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.database import SessionLocal
from backend.models.task_model import Task

# Descriptions for common subtasks
SUBTASK_DESCRIPTIONS = {
    "research legal structure options": "Compare different business structures (Sole Proprietorship, Partnership, LLP, Private Limited) to determine which best fits your needs. Consider factors like liability protection, tax implications, compliance requirements, and future growth plans.",

    "draft initial business plan": "Create a comprehensive business plan covering: Executive Summary, Company Description, Market Analysis, Organization & Management, Products/Services, Marketing Strategy, Financial Projections, and Funding Requirements. Use templates from MSME or SIDBI websites.",

    "register business name": "Check name availability on the MCA portal and reserve your business name. Ensure it's unique, not similar to existing businesses, and complies with naming guidelines. The process typically takes 2-3 days for approval.",

    "obtain business registration number": "Apply for Udyam Registration (for MSMEs) or Shop & Establishment Registration based on your business type. This is usually free and provides you with an official registration number that may be required for licenses and bank accounts.",

    "open business bank account": "Visit your preferred bank with incorporation documents, PAN, address proof, and identity documents. Choose between current account (for high transactions) or savings account (for small businesses). Most banks require a minimum balance of ₹5,000-25,000.",

    "apply for gst registration": "If your annual turnover exceeds ₹40 lakhs (₹20 lakhs for services), GST registration is mandatory. Apply online through the GST portal with your PAN, business documents, and bank details. Registration typically takes 3-7 working days.",

    "setup accounting system": "Choose between cloud-based software (Zoho Books, Tally Prime) or hire a CA. Set up chart of accounts, invoice templates, and expense tracking. Proper accounting from day one prevents compliance issues and helps with tax filing.",

    "acquire necessary licenses": "Identify industry-specific licenses needed for your business (Food License, Trade License, Pollution Control, etc.). Requirements vary by state and business type. Check with local municipal authorities and industry regulators.",

    "set up basic accounting system": "Choose between cloud-based accounting software (Zoho Books, Tally Prime, QuickBooks) or hire a Chartered Accountant. Set up your chart of accounts, create invoice templates, and configure expense tracking. Proper bookkeeping from day one prevents compliance issues during GST filing and helps track profitability. Free options available for small businesses.",

    "set up finances": "Establish your business financial foundation: Open a business bank account, set up accounting software, create a basic budget, and separate personal and business finances. Consider applying for a business credit card for expense tracking. Set up automatic backups of financial records.",

    "apply for required permits": "Research which permits your business needs based on your industry and location. Common permits include: Shop & Establishment License, Trade License, Fire Safety Certificate, Health/Food License (for F&B), Environmental Clearance (for manufacturing). Apply through your state's single window system or respective department portals.",

    "finalize funding strategy": "Determine how you'll fund your business: bootstrapping (self-funded), bank loans, angel investors, venture capital, or government schemes (MUDRA, Startup India). Calculate your runway (how long funds will last) and create a contingency plan. Prepare pitch deck if seeking external investment."
}

def add_descriptions():
    """Add descriptions to subtasks that are missing them."""
    db = SessionLocal()
    try:
        # Get all subtasks (tasks with parent_id) that have no description
        subtasks = db.query(Task).filter(
            Task.parent_id.isnot(None),
            Task.description.is_(None)
        ).all()

        updated_count = 0
        for task in subtasks:
            # Match by title (case-insensitive)
            title_lower = task.title.lower().strip()

            if title_lower in SUBTASK_DESCRIPTIONS:
                task.description = SUBTASK_DESCRIPTIONS[title_lower]
                updated_count += 1
                print(f"Updated: {task.title}")

        db.commit()
        print(f"\nUpdated {updated_count} subtasks out of {len(subtasks)} total")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_descriptions()
