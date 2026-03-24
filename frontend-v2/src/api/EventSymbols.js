/**
 * EventSymbols.js — Centralized mapping for life event icons and colors.
 * Used across SavedPlans, JourneyDetail, JourneyPreview, and WorkflowCard.
 */

export const getEventVisuals = (title = '', displayTitle = '') => {
  const t = (title + ' ' + (displayTitle || '')).toUpperCase()
  
  // Defaults - Neutral "Phase" mapping
  let image = '/images/events/relocation_min.png'
  let color = 'var(--amber)'
  let emoji = '📍'
  let label = 'Phase'
  let colorName = 'amber'

  // 0. Lifecycle / Universal Phases (Special logical mapping)
  if (t.includes('REQUIREMENT') || t.includes('UNDERSTAND') || t.includes('RESEARCH') || t.includes('PLANNING') || t.includes('ANALY') || t.includes('PREP')) {
    image = '/images/events/academic_planning_min.png'; color = 'var(--amber)'; emoji = '📋'; label = 'Planning'; colorName = 'amber'
  }
  else if (t.includes('FINAL') || t.includes('SUCCESS') || t.includes('ARRIVE') || t.includes('CONCLUSION') || t.includes('DESTINATION')) {
    image = '/images/events/event_planning_min.png'; color = 'var(--amber)'; emoji = '🏆'; label = 'Success'; colorName = 'amber'
  }
  else if (t.includes('STEP') || t.includes('CLOSURE') || t.includes('RECLAM') || t.includes('RECEIV') || t.includes('COMPLETE')) {
    image = '/images/events/event_planning_min.png'; color = 'var(--amber)'; emoji = '🏁'; label = 'Finalization'; colorName = 'amber'
  }

  // 1. Relocation / Moving / Repatriation (Amber)
  else if (t.includes('RELOCAT') || t.includes('MOV') || t.includes('TRANSIT') || t.includes('ARRIV') || t.includes('REPATRIAT')) { 
    image = '/images/events/relocation_min.png'; color = 'var(--amber)'; emoji = '🚚'; label = 'Relocation'; colorName = 'amber'
  }
  // 2. Career / Job / Work / Onboarding / Employment (Amber)
  else if (t.includes('JOB') || t.includes('CAREER') || t.includes('WORK') || t.includes('FREELANCE') || t.includes('ONBOARD') || t.includes('RESUME') || t.includes('INTERVIEW') || t.includes('UPSKILL') || t.includes('EMPLOY') || t.includes('PROJECT')) { 
    if (t.includes('ONBOARD')) image = '/images/events/job_onboarding_min.png';
    else if (t.includes('TRANSIT') || t.includes('PIVOT')) { image = '/images/events/career_transition_min.png'; emoji = '🧭'; }
    else if (t.includes('LEARN') || t.includes('UPSKILL') || t.includes('SKILL')) image = '/images/events/education_learning_min.png';
    else image = '/images/events/work_and_career_min.png';
    color = 'var(--amber)'; emoji = emoji === '🧭' ? '🧭' : '💼'; label = 'Career'; colorName = 'amber'
  }
  // 3. Startup / Ideas (💡) - Prioritize ideas/startup keywords for the bulb
  else if (t.includes('STARTUP') || t.includes('ENTREPRENEUR') || t.includes('VENTURE') || t.includes('SAAS') || t.includes('FOUNDING')) { 
    image = '/images/events/business_startup_min.png'; color = 'var(--amber)'; emoji = '💡'; label = 'Startup'; colorName = 'amber'
  }
  // 3b. Business / Growth (🏙️) - Use the new 3D office building for business launches
  else if (t.includes('BUSINESS') || t.includes('COMPANY') || t.includes('INCORPORAT') || t.includes('CORPORATE') || t.includes('LAUNCH')) { 
    image = '/images/events/business_launch_v8_fix.png'; color = 'var(--amber)'; emoji = '🏙️'; label = 'Business'; colorName = 'amber'
  }
  // 4. Home / House / Rental / Property (Emerald)
  else if (t.includes('HOME') || t.includes('RENT') || t.includes('HOUSE') || t.includes('PROPERTY') || t.includes('REAL ESTATE') || t.apartment || t.includes('RESIDENT') || t.includes('RENOVA') || t.includes('MORTGAGE') || t.includes('HOUSING')) { 
    if (t.includes('SEARCH') || t.includes('FIND') || t.includes('HOUSING')) { 
       image = '/images/events/housing_and_location_min.png'; emoji = '🏘️'; 
    }
    else image = '/images/events/home_purchase_min.png';
    color = 'var(--emerald)'; emoji = emoji === '🏘️' ? '🏘️' : '🏠'; label = 'Home'; colorName = 'emerald'
  }
  // 5. Education / Study / Academic (Amber)
  else if (t.includes('EDUC') || t.includes('STUDY') || t.includes('SCHOOL') || t.includes('GRADUATE') || t.includes('ACADEMIC') || t.includes('ENROLL') || t.includes('TEACH') || t.includes('DIPLOMA') || t.includes('DEGREE')) { 
    if (t.includes('ENROLL')) image = '/images/events/educational_enrollment_min.png';
    else if (t.includes('LEARN') || t.includes('SKILL')) image = '/images/events/education_learning_min.png';
    else image = '/images/events/academic_planning_min.png';
    color = 'var(--amber)'; emoji = '🎓'; label = 'Education'; colorName = 'amber'
  }
  // 6. Divorce / Separation / New Path (Sky) - Functional, not emotional
  else if (t.includes('DIVORCE') || t.includes('SEPARATION') || t.includes('RECOVERY') || t.includes('SPLIT')) { 
    image = '/images/events/divorce_min.png'; color = 'var(--sky)'; emoji = '🛤️'; label = 'Divorce'; colorName = 'sky'
  }
  // 7. Grief / Loss / Bereavement (Coral)
  else if (t.includes('GRIEF') || t.includes('REMEMBRANCE') || t.includes('LOSS') || t.includes('BEREAVEMENNT') || t.includes('DEATH') || t.includes('FUNERAL') || t.includes('MOURN')) { 
    image = '/images/events/loss_crisis_min.png'; color = 'var(--coral)'; emoji = '🕊️'; label = 'Remembrance'; colorName = 'coral'
  }
  // 8. Marriage / Wedding / Relationship (Amber)
  else if (t.includes('MARRIAGE') || t.includes('WEDDING') || t.includes('RELATIONSHIP') || t.includes('ENGAGEMENT') || t.includes('ANNIVERSARY') || t.includes('PARTNER')) { 
    image = '/images/events/marriage_planning_min.png'; color = 'var(--amber)'; emoji = '💍'; label = 'Marriage'; colorName = 'amber'
  }
  // 9. Finance / Money / Banking / Discipline / Wealth (Emerald)
  else if (t.includes('MONEY') || t.includes('FINANCE') || t.includes('DEBT') || t.includes('INVEST') || t.includes('TAX') || t.includes('SAVINGS') || t.includes('BANK') || t.includes('PAYMENT') || t.includes('ACCOUNT') || t.includes('BUDGET') || t.includes('REVENUE') || t.includes('ASSET') || t.includes('DISCIPLINE')) { 
    image = '/images/events/money_assets_min.png'; color = 'var(--emerald)'; emoji = '💰'; label = 'Finance'; colorName = 'emerald'
  }
  // 10. Legal / Visa / Identity / Passport / Verification / Documents (Sky)
  else if (t.includes('LEGAL') || t.includes('VISA') || t.includes('IDENTITY') || t.includes('PASSPORT') || t.includes('CITIZEN') || t.includes('PERMIT') || t.includes('DOC') || t.includes('VERIF') || t.includes('COURT') || t.includes('LAWYER') || t.includes('NOTARI') || t.includes('WILL')) { 
    if (t.includes('VISA') || t.includes('PASSPORT')) image = '/images/events/visa_application_min.png';
    else if (t.includes('WILL') || t.includes('TESTAMENT')) image = '/images/events/last_will_min.png';
    else if (t.includes('IDENTITY') || t.includes('PERSONA')) image = '/images/events/legal_identity_min.png';
    else image = '/images/events/legal_identity_min.png';
    color = 'var(--sky)'; emoji = t.includes('DOC') ? '📃' : '⚖️'; label = 'Legal'; colorName = 'sky'
  }
  // 11. Travel / Trip / Vacation / Digital Nomad (Amber)
  else if (t.includes('TRAVEL') || t.includes('TRIP') || t.includes('VACATION') || t.includes('NOMAD') || t.includes('JOURNEY') || t.includes('EXPLOR') || t.includes('FLIGHT')) { 
    image = '/images/events/relocation_min.png'; color = 'var(--amber)'; emoji = '✈️'; label = 'Travel'; colorName = 'amber'
  }
  // 12. Vehicle / Car / Boat / Bike (Amber)
  else if (t.includes('VEHICLE') || t.includes('CAR ') || t.includes('BOAT') || t.includes('BIKE') || t.includes('AUTOMOBILE') || t.includes('DRIVE')) { 
    image = '/images/events/vehicle_purchase_min.png'; color = 'var(--amber)'; emoji = '🚗'; label = 'Vehicle'; colorName = 'amber'
  }
  // 13. Medical / Surgery / Doctor / Crisis / Disability (Coral)
  else if (t.includes('MEDICAL') || t.includes('SURGERY') || t.includes('DOCTOR') || t.includes('HOSPITAL') || t.includes('CLINIC') || t.includes('PHYSICAL') || t.includes('DENTIST') || t.includes('CRISIS') || t.includes('HEALTH') || t.includes('DISABIL')) { 
    if (t.includes('DISABIL') || t.includes('LONG TERM')) image = '/images/events/health_disability_min.png';
    else image = '/images/events/medical_emergency_min.png';
    color = 'var(--coral)'; emoji = '🏥'; label = 'Medical'; colorName = 'coral'
  }
  // 14. Event / Planning / Party (Amber)
  else if (t.includes('EVENT') || t.includes('PARTY') || t.includes('CELEBRAT')) { 
    image = '/images/events/event_planning_min.png'; color = 'var(--amber)'; emoji = '🎉'; label = 'Event'; colorName = 'amber'
  }
  // 15. Retirement (Amber)
  else if (t.includes('RETIRE')) {
    image = '/images/events/retirement_min.png'; color = 'var(--amber)'; emoji = '🌅'; label = 'Retirement'; colorName = 'amber'
  }
  // 16. Pets (Sage)
  else if (t.includes('PET') || t.includes('ANIMAL') || t.includes('ADOPTION')) {
    image = '/images/events/pet_adoption_min.png'; color = 'var(--sage)'; emoji = '🐈'; label = 'Pets'; colorName = 'sage'
  }
  // 17. Zen / Peace / Growth (Sky/Sage)
  else if (t.includes('ZEN') || t.includes('PEACE') || t.includes('WELLNESS')) {
    image = '/images/events/peace_zen_min.png'; color = 'var(--sky)'; emoji = '🧘'; label = 'Mindfulness'; colorName = 'sky'
  }
  else if (t.includes('GROWTH') || t.includes('HABIT') || t.includes('SELF') || t.includes('PERSONAL')) {
    image = '/images/events/personal_growth_min.png'; color = 'var(--sage)'; emoji = '🌱'; label = 'Growth'; colorName = 'sage'
  }
  // 18. Family (Sage)
  else if (t.includes('FAMILY') || t.includes('PARENT') || t.includes('CHILD') || t.includes('RELATIVE')) {
    if (t.includes('BABY') || t.includes('PARENTING')) image = '/images/events/parenting_care_min.png';
    else image = '/images/events/family_relations_min.png';
    color = 'var(--sage)'; emoji = '👪'; label = 'Family'; colorName = 'sage'
  }

  return { image, color, emoji, label, colorName }
}
