# ✅ Skills System Installed

Your Pathfinder AI project now has an **automatic skills system** that ensures code quality and prevents common mistakes.

## What Changed

### 1. Skills Directory Created
```
.claude/skills/
├── README.md                          # Quick reference guide
├── backend-tests.md                   # Backend testing patterns
├── tdd-superpowers.md                 # Test-driven development workflow
├── portal-registry-guardrail.md       # Config-driven architecture enforcer
└── webapp-testing.md                  # E2E testing with Playwright
```

### 2. CLAUDE.md Updated
Added **Auto-Applied Skills System** section that explains:
- Which skills auto-apply when
- What behaviors to expect
- Skill priority order
- How to override (for prototypes only)

## How It Works Now

### Before (Manual, Error-Prone)
```
You: "Add Tamil Nadu support"
Claude: *writes hardcoded portal URLs*
You: "Wait, that should come from the registry!"
Claude: *fixes it, but no tests*
You: "We need tests!"
... back and forth ...
```

### After (Automatic, Quality-Focused)
```
You: "Add Tamil Nadu support"

Claude (auto-applying skills):
1. "Let me read portal_registry.json first..." (Portal Registry Guardrail)
2. "Here are the test cases I'll write:" (TDD Superpowers)
   - Happy path: TN domicile → Tamil Nadu e-Services portal
   - Edge case: Unknown TN city → fallback to state portal
3. "Approve these tests before I implement?" (Backend Tests)

You: "Looks good!"

Claude:
4. *Writes failing tests*
5. *Updates portal_registry.json*
6. *Runs tests (pass)*
7. "Should I run E2E tests to verify the UI?" (Webapp Testing)
```

## What You'll Notice

### When Working on Backend

**Triggers:** Editing files in `backend/services/`, `backend/routes/`, working with portals/tasks

**Automatic Behaviors:**
- ✓ Reads `portal_registry.json` before making changes
- ✓ Asks clarifying questions about requirements
- ✓ Shows test cases and waits for approval
- ✓ Writes tests BEFORE implementation
- ✓ Never hardcodes portal URLs, timelines, or URN patterns
- ✓ Uses `portal_registry_service.py` helpers

**Example:**
```
You: "Fix the Bangalore domicile portal bug"

Claude:
"Let me understand the bug first:
1. What's happening now? (current behavior)
2. What should happen? (expected behavior)

Then I'll:
1. Write a test that reproduces the bug
2. Check portal_registry.json for the config
3. Fix the root cause
4. Verify the test passes"
```

### When Working on Frontend

**Triggers:** Testing UI flows, validating integrations, E2E testing

**Automatic Behaviors:**
- ✓ Suggests Playwright E2E tests after backend changes
- ✓ Validates Portal Registry + Frontend wiring
- ✓ Tests complete user journeys
- ✓ Verifies correct portals, prerequisites, timelines render

**Example:**
```
You: "Test the Pune rent agreement flow"

Claude:
"I'll create a Playwright test that:
1. Navigates to dashboard
2. Creates 'Relocating to Pune' event
3. Verifies 'Rent Agreement' task appears
4. Checks offline process note shows
5. Verifies no online portal button (since it's offline)

Should I also test the Bangalore rent flow for comparison?"
```

## Key Skills & Their Jobs

### 1. Portal Registry Guardrail (Highest Priority)
**Job:** Prevent hardcoding, enforce config-driven architecture

**You'll hear:**
- "Let me check portal_registry.json first..."
- "This task_type isn't in the registry yet - I'll add it"
- "I'm using get_portal_for_task() instead of hardcoding"

### 2. TDD Superpowers
**Job:** Ensure quality process and prevent bugs

**You'll hear:**
- "Let me understand the requirements first..."
- "Here are the test cases I'll cover..."
- "Should I write the test before implementing?"

### 3. Backend Tests
**Job:** Ensure comprehensive test coverage

**You'll hear:**
- "I'll write tests with AAA pattern (Arrange-Act-Assert)"
- "Covering happy path + 2 edge cases"
- "Let me add integration tests for this"

### 4. Webapp Testing
**Job:** Validate end-to-end user experience

**You'll hear:**
- "Should I run E2E tests to verify?"
- "I'll test this flow in Playwright"
- "Let me verify the Portal Registry + Frontend are aligned"

## Benefits You Get

### 🛡️ Prevention
- No hardcoded portal URLs
- No missing tests
- No registry/code mismatches
- No broken user flows

### ⚡ Speed
- Less back-and-forth
- Fewer bugs to fix later
- Clear process every time

### 📈 Quality
- Consistent code structure
- Comprehensive test coverage
- Config-driven architecture maintained
- E2E validation built-in

## How to Use

### Just tell Claude what you want:

**Backend Work:**
- "Add support for Gujarat state"
- "Create a marriage certificate task type"
- "Fix the URN extraction for EPFO"

**Frontend Work:**
- "Test the Bangalore domicile flow"
- "Verify all KA tasks show Seva Sindhu"

**Skills auto-apply** - you don't need to remember them!

### For Quick Prototypes:
```
"Skip skills for now, just show me the concept"
```

### For Production Code:
Skills are mandatory and ensure quality.

## Testing the Skills

Try these to see the skills in action:

1. **Backend:** "Add support for a new state called Tamil Nadu"
   - Watch Portal Registry Guardrail + TDD Superpowers activate

2. **Frontend:** "Test the Bangalore domicile certificate flow end-to-end"
   - Watch Webapp Testing activate

3. **Bug Fix:** "Fix the bug where Pune rent agreement doesn't show offline note"
   - Watch all skills coordinate together

## Questions?

See `.claude/skills/README.md` for quick reference, or check individual skill files for detailed examples and patterns.

---

**Your Pathfinder AI project is now protected by automatic quality guardrails!** 🎯
