# Pathfinder AI Skills System

## Quick Reference

These skills automatically apply when you're working on relevant code. You don't need to invoke them - Claude Code detects the context and applies them.

## Installed Skills

### 🔧 Backend Skills

1. **backend-tests.md** - Test-first development for backend
   - Auto-applies: Working in `backend/services/`, `backend/routes/`
   - Forces AAA test pattern (Arrange-Act-Assert)
   - Requires tests before implementation

2. **tdd-superpowers.md** - Strict TDD workflow
   - Auto-applies: New features, bug fixes, core logic changes
   - 5-phase workflow: Understand → Test → Implement → Refactor → Review
   - Deletes production code written before tests

3. **portal-registry-guardrail.md** - Config-driven architecture enforcer
   - Auto-applies: Anything involving portals, task_types, timelines, URNs
   - Never allows hardcoded portal data
   - Always uses `backend/data/portal_registry.json`

### 🎨 Frontend Skills

4. **webapp-testing.md** - E2E testing with Playwright
   - Auto-applies: Testing UI flows, portal integration
   - Tests complete user journeys
   - Validates Portal Registry + Frontend alignment

5. **frontend-design.md** - Design system enforcer
   - Auto-applies: Building React components, UI layouts, dashboards
   - Enforces dark forest theme, Outfit/Inter fonts, emerald accents
   - Ensures visual hierarchy, consistent spacing, accessibility

6. **ui-ux-excellence.md** - UX best practices
   - Auto-applies: Designing forms, dashboards, user flows
   - User-centered design, error prevention, clear feedback
   - Accessibility, mobile-first responsive design

### 🐛 Debugging & Quality Skills

7. **systematic-debugging.md** - Structured debugging process
   - Auto-applies: Debugging bugs, investigating errors
   - 6-phase process: Reproduce → Isolate → Understand → Test → Fix → Verify
   - No random edits - systematic root cause analysis

## How Auto-Application Works

Claude Code reads your task description and file paths, then automatically applies relevant skills.

### Example Scenarios

**You say:** "Add support for Tamil Nadu state"
**Skills applied:**
- ✓ Portal Registry Guardrail (reads registry first)
- ✓ Backend Tests (writes tests for TN portals)
- ✓ TDD Superpowers (follows test-first workflow)

**You say:** "Fix the bug where Bangalore domicile shows wrong portal"
**Skills applied:**
- ✓ TDD Superpowers (reproduces bug with test)
- ✓ Portal Registry Guardrail (checks registry config)
- ✓ Backend Tests (ensures fix has test coverage)

**You say:** "Test the Pune rent agreement flow"
**Skills applied:**
- ✓ Webapp Testing (runs Playwright E2E test)

## Skill Behaviors You'll Notice

When skills are active, Claude will:

1. **Ask clarifying questions first** (from TDD Superpowers)
   - "What's the expected behavior?"
   - "What are the edge cases?"

2. **Read config files before coding** (from Portal Registry Guardrail)
   - Always checks `portal_registry.json`
   - Verifies task_type exists

3. **Write tests first** (from Backend Tests + TDD Superpowers)
   - Shows you the test cases
   - Asks for approval before implementation

4. **Validate end-to-end** (from Webapp Testing)
   - Suggests E2E tests after backend changes
   - Verifies frontend renders correctly

## Overriding Skills

For quick prototypes or explorations:
```
"Skip skills for now, just show me the concept"
```

For production code: **Skills cannot be skipped** - they ensure quality and prevent bugs.

## Skill Priority

When multiple skills apply:
1. Portal Registry Guardrail (prevents hardcoding)
2. TDD Superpowers (ensures process)
3. Backend Tests (ensures coverage)
4. Webapp Testing (validates E2E)

## Need Help?

See individual skill files for detailed examples:
- `backend-tests.md` - Backend testing patterns
- `tdd-superpowers.md` - TDD workflow examples
- `portal-registry-guardrail.md` - Registry structure and rules
- `webapp-testing.md` - Playwright E2E test examples
