"""
Layer 3.3 — Static Expert Knowledge Fallback.
Provides high-quality, pre-written requirement summaries for common life events.
Used as a 'Safety Net' when all AI models (OpenRouter/Gemini) are failing or rate-limited.
Ensures the user ALWAYS sees professional content during demos/reviews.
"""
from typing import Dict, List
from backend.schemas.nlp_schema import LifeEventType

# High-quality, expert-vetted essentials for common life events
EXPERT_FALLBACKS: Dict[LifeEventType, str] = {
    LifeEventType.BUSINESS_STARTUP: """\
### Strategic Overview
Launching a business requires careful legal structuring and regulatory compliance from day one.

### 1. Primary Essentials
- **Business Structure & Registration**: Selection of entity type (Private Limited, LLP, or Sole Proprietorship) and official incorporation.
- **Tax Identification (PAN/TAN)**: Registration for business tax IDs and Goods and Services Tax (GST) if applicable.
- **Operating Licenses**: Industry-specific permits and local Shop & Establishment licenses.

### 2. From Authorities & Third Parties
- **NOCs & Clearances**: No Objection Certificates from pollution boards or fire safety where applicable.
- **Bank Account Setup**: Dedicated business account requires specific board resolutions or incorporation certificates.
- **Digital Signature Certificates (DSC)**: Necessary for online filing and secure document signing in many jurisdictions.

### 3. Action & Submission Needs
- **Domain & Branding**: Registration of trademark and digital assets to protect intellectual property.
- **Employee Paperwork**: Compliance with labor laws, including EPF (Employee Provident Fund) and insurance.

### 4. Common Mistakes & Expert Tips
- **Mixing Personal Funds**: Always keep business and personal finances separate from the beginning.
- **Ignoring Local Zoning**: Validating your business location against local land-use laws before signing a lease.
""",

    LifeEventType.RELOCATION: """\
### Strategic Overview
Moving, especially internationally, demands strict coordination between immigration status and physical logistics.

### 1. Primary Essentials
- **Address Verification**: New lease agreement or utility bills to prove residence at your destination.
- **Logistics & Packing**: Inventory list and insurance for household goods during transit.
- **Customs Documentation**: Detailed declaration for any restricted or dutiable items being moved.

### 2. From Authorities & Third Parties
- **ID Updates**: Updating your driver's license and national identity cards with the new residential details.
- **Bank Transfers**: Notifying financial institutions and potentially setting up local bank accounts in the new city.
- **School & Medical Records**: Certified copies for children's enrollment and local healthcare continuity.

### 3. Action & Submission Needs
- **Exit Formalities**: Termination of previous utility contracts and mail forwarding setup.
- **Local Taxes**: Registration with local municipal authorities for tax and voting purposes.

### 4. Common Mistakes & Expert Tips
- **Poor Inventory Detail**: Accurate inventory lists save weeks of delays in customs and insurance claims.
- **Ignoring Insurance**: Standard moving coverage is often insufficient for high-value personal assets.
""",

    LifeEventType.LEGAL_AND_IDENTITY: """\
### Strategic Overview
Maintaining valid identity documents is the cornerstone of processing any further legal or civic request.

### 1. Primary Essentials
- **Current Identity Proof**: Valid Passport, National ID, or Driver's License as the primary source of truth.
- **Evidence of Change**: Certificates for marriage, divorce, or official name changes where applicable.
- **Biometric Enrolment**: Modern identity systems often require physical fingerprinting or iris scanning.

### 2. From Authorities & Third Parties
- **Verification Records**: Police clearance certificates or background verification reports for high-security applications.
- **Certified Translations**: Apostille or legalized translations for documents being used in foreign countries.

### 3. Action & Submission Needs
- **Recent Photographs**: High-resolution passport-sized photos meeting specific technical standards.
- **Online portal registration**: Accessing official government systems for secure document submission.

### 4. Common Mistakes & Expert Tips
- **Expiring Documents**: Never wait until the last 6 months of validity to start a renewal process.
- **Name Mismatches**: Ensure your name is spelled IDENTICALLY across all supporting evidence (e.g. Aadhar vs Passport).
""",

    LifeEventType.VISA_APPLICATION: """\
### Strategic Overview
Visa success is determined by proving clear intent, strong financial ties, and strict adherence to the host country's rules.

### 1. Primary Essentials
- **Valid Passport**: Must have at least 6 months’ validity beyond your intended stay.
- **Proof of Funds**: Bank statements or sponsorship letters proving financial stability.
- **Travel Itinerary**: Detailed plan of stay, including flight bookings and hotel reservations.

### 2. From Authorities & Third Parties
- **Sponsorship Documents**: Invitations from residents or letters of support from employers/universities.
- **Health Insurance**: Mandatory medical coverage for the duration of the stay in most jurisdictions.

### 3. Action & Submission Needs
- **Covering Letter**: A clear, typed letter explaining the exact purpose and duration of the trip.
- **Visa Fee Payment**: Proof of transaction for the non-refundable processing fees.

### 4. Common Mistakes & Expert Tips
- **Vague Itineraries**: Border agents and visa officers prefer specific dates and named locations.
- **Missing Proof of Ties**: Always emphasize reasons you MUST return to your home country (job, family, property).
"""
}

# Generic fallback for unlisted types
GENERIC_EXPERT_GUIDE = """\
### Strategic Overview
Your request involves a unique planning journey. Focus on core documentation first to build a solid foundation.

### 1. Primary Essentials
- **Verified Identity Proof**: Ensure you have valid, updated national ID or passport documents.
- **Financial Baseline**: Prepare current bank statements and proof of income or assets relevant to your request.
- **Historical Records**: Any previous certificates or legal documents that define your current status.

### 2. From Authorities & Third Parties
- **Expert Consultations**: Depending on the complexity, seek advice from legal or financial professionals.
- **Official Clearances**: Check for any necessary government permits or professional associations required.

### 3. Action & Submission Needs
- **Digital Transformation**: Scan all physical documents into high-quality PDFs for online submission.
- **Deadline Monitoring**: Create a calendar of any hard deadlines or renewal dates.

### 4. Common Mistakes & Expert Tips
- **Ignoring Fine Print**: Always read the 'Terms and Conditions' or 'Eligibility Criteria' before submitting applications.
- **Data Inconsistency**: Maintain 100% consistency in names, dates, and addresses across all files.
"""

def get_expert_fallback(event_type: LifeEventType) -> str:
    """Returns the best matching expert guide for the given type."""
    return EXPERT_FALLBACKS.get(event_type, GENERIC_EXPERT_GUIDE)
