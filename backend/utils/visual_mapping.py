"""
visual_mapping.py — Backend source of truth for event icons and colors.
Mirrors and centralizes the logic for Life Event visual representation.
"""

def get_event_visuals(title: str = "", display_title: str = ""):
    t = (str(title) + " " + (str(display_title) if display_title else "")).upper()
    
    # Defaults - Neutral "Phase" mapping
    image = "/images/events/relocation_min.png"
    color = "#d47c3f" # Amber
    emoji = "📍"
    label = "Phase"
    color_name = "amber"

    # 0. Lifecycle / Universal Phases 
    if any(x in t for x in ["REQUIREMENT", "UNDERSTAND", "RESEARCH", "PLANNING", "ANALY", "PREP"]):
        image = "/images/events/academic_planning_min.png"; color = "#f2c94c"; emoji = "📋"; label = "Planning"; color_name = "gold"
    elif any(x in t for x in ["FINAL", "SUCCESS", "ARRIVE", "CONCLUSION", "DESTINATION"]):
        image = "/images/events/event_planning_min.png"; color = "#d47c3f"; emoji = "🏆"; label = "Success"; color_name = "amber"
    elif any(x in t for x in ["STEP", "CLOSURE", "RECLAM", "RECEIV", "COMPLETE"]):
        image = "/images/events/event_planning_min.png"; color = "#d47c3f"; emoji = "🏁"; label = "Finalization"; color_name = "amber"

    # 1. Relocation / Moving / Repatriation (Amber)
    elif any(x in t for x in ["RELOCAT", "MOV", "TRANSIT", "ARRIV", "REPATRIAT"]):
        image = "/images/events/relocation_min.png"; color = "#d47c3f"; emoji = "📦"; label = "Relocation"; color_name = "amber"
    
    # 2. Career / Job / Work / Onboarding / Employment (Gold)
    elif any(x in t for x in ["JOB", "CAREER", "WORK", "FREELANCE", "ONBOARD", "RESUME", "INTERVIEW", "UPSKILL", "EMPLOY", "PROJECT"]):
        if "ONBOARD" in t: image = "/images/events/job_onboarding_min.png"
        elif any(x in t for x in ["TRANSIT", "PIVOT"]): image = "/images/events/career_transition_min.png"
        elif any(x in t for x in ["LEARN", "UPSKILL", "SKILL"]): image = "/images/events/education_learning_min.png"
        else: image = "/images/events/work_and_career_min.png"
        color = "#f2c94c"; emoji = "💼"; label = "Career"; color_name = "gold"
    
    # 3. Startup / Business (Gold)
    elif any(x in t for x in ["BUSINESS", "STARTUP", "ENTREPRENEUR", "INCORPORAT", "COMPANY", "FOUNDING", "VENTURE", "SAAS"]):
        image = "/images/events/business_startup_min.png"; color = "#f2c94c"; emoji = "💡"; label = "Business"; color_name = "gold"
    
    # 4. Home / Housing (Emerald)
    elif any(x in t for x in ["HOME", "RENT", "HOUSE", "PROPERTY", "REAL ESTATE", "APARTMENT", "RESIDENT", "RENOVA", "MORTGAGE", "HOUSING"]):
        if any(x in t for x in ["SEARCH", "FIND", "HOUSING"]):
            image = "/images/events/housing_and_location_min.png"; emoji = "🏘️"
        else:
            image = "/images/events/home_purchase_min.png"
        color = "#5c8c75"; emoji = emoji if emoji == "🏘️" else "🏠"; label = "Home"; color_name = "emerald"
    
    # 5. Education (Gold)
    elif any(x in t for x in ["EDUC", "STUDY", "SCHOOL", "GRADUATE", "ACADEMIC", "ENROLL", "TEACH", "DIPLOMA", "DEGREE"]):
        if "ENROLL" in t: image = "/images/events/educational_enrollment_min.png"
        elif any(x in t for x in ["LEARN", "SKILL"]): image = "/images/events/education_learning_min.png"
        else: image = "/images/events/academic_planning_min.png"
        color = "#f2c94c"; emoji = "🎓"; label = "Education"; color_name = "gold"
    
    # 6. Divorce (Sky)
    elif any(x in t for x in ["DIVORCE", "SEPARATION", "RECOVERY", "SPLIT"]):
        image = "/images/events/divorce_min.png"; color = "#38bdf8"; emoji = "⚖️"; label = "Divorce"; color_name = "sky"
    
    # 7. Remembrance (Coral)
    elif any(x in t for x in ["GRIEF", "REMEMBRANCE", "LOSS", "BEREAVEMENT", "DEATH", "FUNERAL", "MOURN"]):
        image = "/images/events/loss_crisis_min.png"; color = "#c65d4a"; emoji = "🌿"; label = "Remembrance"; color_name = "coral"
    
    # 8. Marriage (Gold)
    elif any(x in t for x in ["MARRIAGE", "WEDDING", "RELATIONSHIP", "ENGAGEMENT", "ANNIVERSARY", "PARTNER"]):
        image = "/images/events/marriage_planning_min.png"; color = "#f2c94c"; emoji = "💍"; label = "Marriage"; color_name = "gold"
    
    # 9. Finance / Assets (Emerald)
    elif any(x in t for x in ["MONEY", "FINANCE", "DEBT", "INVEST", "TAX", "SAVINGS", "BANK", "PAYMENT", "ACCOUNT", "BUDGET", "REVENUE", "ASSET"]):
        image = "/images/events/money_assets_min.png"; color = "#5c8c75"; emoji = "💰"; label = "Finance"; color_name = "emerald"
    
    # 10. Legal / Identity (Sky)
    elif any(x in t for x in ["LEGAL", "VISA", "IDENTITY", "PASSPORT", "CITIZEN", "PERMIT", "DOCUMENT", "VERIF", "COURT", "LAWYER", "NOTARI", "WILL"]):
        if any(x in t for x in ["VISA", "PASSPORT"]): image = "/images/events/visa_application_min.png"
        elif any(x in t for x in ["WILL", "TESTAMENT"]): image = "/images/events/last_will_min.png"
        elif any(x in t for x in ["IDENTITY", "PERSONA"]): image = "/images/events/legal_identity_min.png"
        else: image = "/images/events/legal_identity_min.png"
        color = "#38bdf8"; emoji = "⚖️"; label = "Legal"; color_name = "sky"
    
    # 11. Travel (Amber)
    elif any(x in t for x in ["TRAVEL", "TRIP", "VACATION", "NOMAD", "JOURNEY", "EXPLOR", "FLIGHT"]):
        image = "/images/events/relocation_min.png"; color = "#d47c3f"; emoji = "✈️"; label = "Travel"; color_name = "amber"
    
    # 12. Vehicle (Amber)
    elif any(x in t for x in ["VEHICLE", "CAR ", "BOAT", "BIKE", "AUTOMOBILE", "DRIVE"]):
        image = "/images/events/vehicle_purchase_min.png"; color = "#d47c3f"; emoji = "🚗"; label = "Vehicle"; color_name = "amber"
    
    # 13. Medical / Disability (Coral)
    elif any(x in t for x in ["MEDICAL", "SURGERY", "DOCTOR", "HOSPITAL", "CLINIC", "PHYSICAL", "DENTIST", "CRISIS", "HEALTH", "DISABIL"]):
        if any(x in t for x in ["DISABIL", "LONG TERM"]): image = "/images/events/health_disability_min.png"
        else: image = "/images/events/medical_emergency_min.png"
        color = "#c65d4a"; emoji = "🏥"; label = "Medical"; color_name = "coral"
    
    # 14. Event (Amber)
    elif any(x in t for x in ["EVENT", "PARTY", "CELEBRAT"]):
        image = "/images/events/event_planning_min.png"; color = "#d47c3f"; emoji = "🎉"; label = "Event"; color_name = "amber"
    
    # 15. Retirement (Gold)
    elif "RETIRE" in t:
        image = "/images/events/retirement_min.png"; color = "#f2c94c"; emoji = "🏆"; label = "Retirement"; color_name = "gold"
    
    # 16. Pets (Sage)
    elif any(x in t for x in ["PET", "ANIMAL", "ADOPTION"]):
        image = "/images/events/pet_adoption_min.png"; color = "#7ba091"; emoji = "🐈"; label = "Pets"; color_name = "sage"
    
    # 17. Wellness / Mindfulness (Sky)
    elif any(x in t for x in ["ZEN", "PEACE", "WELLNESS"]):
        image = "/images/events/peace_zen_min.png"; color = "#38bdf8"; emoji = "🧘"; label = "Mindfulness"; color_name = "sky"
    
    # 18. Personal Growth (Sage)
    elif any(x in t for x in ["GROWTH", "HABIT", "SELF", "PERSONAL"]):
        image = "/images/events/personal_growth_min.png"; color = "#7ba091"; emoji = "🌱"; label = "Growth"; color_name = "sage"
    
    # 19. Family (Sage)
    elif any(x in t for x in ["FAMILY", "PARENT", "CHILD", "RELATIVE", "PARENTING", "BABY"]):
        if any(x in t for x in ["BABY", "PARENTING"]): image = "/images/events/parenting_care_min.png"
        else: image = "/images/events/family_relations_min.png"
        color = "#7ba091"; emoji = "👪"; label = "Family"; color_name = "sage"

    return {
        "image": image,
        "color": color,
        "emoji": emoji,
        "label": label,
        "colorName": color_name
    }
