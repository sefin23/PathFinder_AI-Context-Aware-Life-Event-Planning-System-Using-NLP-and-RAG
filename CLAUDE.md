# CLAUDE.md - Pathfinder AI Master Context

## 🌌 Project Overview: What is Pathfinder AI?

Pathfinder AI is a **Life-Event Oriented Planning Assistant**. Unlike a generic to-do list, it helps users navigate complex, long-running life situations (e.g., "Moving to a new city for a first job" or "Starting a small business").

### 🧠 Core Philosophy
1.  **Life-Event First, Not Task First**: Tasks only exist within the context of a "Life Event." We handle 10 Universal Domains: Housing, Work, Education, Health, Family, Money, Legal, Parenting, Loss, and Personal Growth.
2.  **AI Assists, Never Decides**: The AI (via RAG) *proposes* workflows and tasks based on curated knowledge. The user must explicitly approve or modify them.
3.  **Progressive Clarification**: We accept vague input and clarify details gradually to reduce user stress.
4.  **RAG-Driven (No Hallucinations)**: We use a Retrieval-Augmented Generation pipeline. We don't scrape the web live for logic; we look up 100+ hand-curated "Requirement Chunks" from our SQLite knowledge base.

---

## 🎨 Design Philosophy (Level 2: Skills)

Pathfinder AI must look like a premium, human-designed product, not generic AI output.

### 🚫 The "Anti-AI" Ban List
- **NO Default Purple/Indigo**: Never use `bg-indigo-600` or `text-purple-600` as primary colors. They look like Claude/Tailwind defaults.
- **NO Generic Layouts**: Avoid the "3-item feature grid" unless specifically asked.
- **NO Placeholder Text**: Use realistic, researched data instead of "Lorem Ipsum" or "Boost your productivity".
- **NO Excessive Text**: Keep UI clean. Use cards, accordions, and tabs to hide complexity.

### ✅ Premium Aesthetics
- **Colors**: Use a curated palette (e.g., Slate/Zinc backgrounds with subtle accents like Emerald or Rose).
- **Typography**: Use modern pairings (e.g., **Outfit** for headers, **Inter** for body text).
- **Micro-interactions**: Add subtle scale-up or fade-in animations to modals and buttons.
- **Glassmorphism**: Use `backdrop-blur` and thin borders on overlays.

---

## 🏗️ ANF Framework (Level 3: Methodology)

When building new pages or features, follow the **Assemble → Normalize → Fill** workflow.

### 1. ASSEMBLE (Modular Construction)
- Check `frontend-v2/ui-library/` for professional component references.
- Instead of building from scratch, read these reference files and combine them.
- Ensure shadcn/ui components are used for the foundation.

### 2. NORMALIZE (Visual Coherence)
- After adding a component, audit the entire page.
- **Fonts**: Ensure all headers match the Outfit/Inter hierarchy.
- **Spacing**: Use standard 4px or 8px increments (e.g., `p-4`, `p-8`, `gap-6`).
- **Colors**: Align the new component's color tokens with the existing CSS variables in `index.css`.

### 3. FILL (Contextual Realism)
- Perform a "Research Session" before writing content.
- Use info from `docs/` or search (if available) to generate realistic Life Event data.
- Personalize text to the user's specific journey (e.g., "Moving to New York" vs. "Relocating").

---

## 🛠️ Technical Context
- **Frontend**: React (Vite) + Tailwind CSS + Shadcn/UI.
- **Backend**: FastAPI + SQLAlchemy.
- **AI**: Gemini/Llama/Nemotron via OpenRouter.

## 🚀 Common Commands
- **Run Dev**: `cd frontend-v2; npm run dev`
- **Build**: `cd frontend-v2; npm run build`
- **Lint**: `cd frontend-v2; npm run lint`

---

## 🎯 Auto-Applied Skills System

Claude Code automatically applies relevant skills from `.claude/skills/` based on the task at hand. **You don't need to ask for these - they apply automatically.**

### Backend Skills (Auto-activate when working with backend code)

#### 1. **Backend Tests Skill** → `.claude/skills/backend-tests.md`
**Triggers:** Working in `backend/services/`, `backend/routes/`, fixing bugs, creating features
**Behavior:**
- Forces test-first development (AAA pattern)
- Requires tests before implementation
- Covers portal_registry_service, URN extraction, timeline calculations
- **Mandatory:** Ask "Should I write the test first?" before implementing

#### 2. **TDD Superpowers Skill** → `.claude/skills/tdd-superpowers.md`
**Triggers:** New features, bug fixes, modifying core logic
**Behavior:**
- Enforces 5-phase workflow: Understand → Test → Implement → Refactor → Review
- Deletes production code written before tests exist
- Requires mini-spec with examples before coding
- **Mandatory:** Show test cases and ask for approval before implementation

#### 3. **Portal Registry Guardrail Skill** → `.claude/skills/portal-registry-guardrail.md`
**Triggers:** Mentions of portal, task_type, timeline, URN, state_code, job_city
**Behavior:**
- Never allows hardcoded portal URLs, timelines, or URN patterns
- Always uses `portal_registry_service.py` helpers
- Updates `backend/data/portal_registry.json` FIRST before code
- Validates all new task_types exist in registry
- **Mandatory:** Read portal_registry.json before any portal/task changes

### Frontend Skills (Auto-activate when working with frontend code)

#### 4. **Webapp Testing Skill** → `.claude/skills/webapp-testing.md`
**Triggers:** Testing UI flows, validating portal integration, E2E user journeys
**Behavior:**
- Uses Playwright for browser automation
- Tests complete flows (Bangalore domicile, Pune rent, etc.)
- Validates Portal Registry + Frontend wiring
- Verifies correct portal URLs, prerequisites, timelines render
- **Mandatory:** After Portal Registry changes, ask "Should I run E2E tests?"

#### 5. **Frontend Design Skill** → `.claude/skills/frontend-design.md`
**Triggers:** Building React components, UI layouts, dashboards, user-facing features
**Behavior:**
- Enforces Pathfinder AI design system (dark forest theme, Outfit/Inter fonts, emerald accents)
- Ensures visual hierarchy, consistent spacing, and accessibility
- Uses proper component patterns (cards, buttons, forms)
- Adds micro-interactions and loading states
- **Mandatory:** Follow the color palette and typography scale from the design system

#### 6. **UI/UX Excellence Skill** → `.claude/skills/ui-ux-excellence.md`
**Triggers:** Designing forms, dashboards, user flows, interactive elements
**Behavior:**
- User-centered design (reduce cognitive load, progressive disclosure)
- Error prevention over error messages
- Clear loading/error/empty/success states
- Accessibility requirements (keyboard nav, ARIA labels, focus indicators)
- Mobile-first responsive design
- **Mandatory:** Every input needs a label, every action needs feedback

### Debugging & Quality Skills (Auto-activate when fixing issues)

#### 7. **Systematic Debugging Skill** → `.claude/skills/systematic-debugging.md`
**Triggers:** Debugging bugs, investigating errors, troubleshooting failures
**Behavior:**
- 6-phase process: Reproduce → Isolate → Understand → Test → Fix → Verify
- No random edits - systematic elimination
- Write failing test before fixing
- Fix root cause, not symptoms
- Comprehensive logging and inspection tools
- **Mandatory:** Must reproduce bug and understand root cause before attempting fix

### How It Works

When you say things like:
- "Add support for Tamil Nadu" → **Portal Registry Guardrail** + **Backend Tests** + **TDD Superpowers** auto-apply
- "Fix the URN extraction bug" → **Systematic Debugging** + **TDD Superpowers** + **Backend Tests** auto-apply
- "Test the Bangalore flow" → **Webapp Testing** auto-applies
- "Create a new task type for marriage certificate" → **All backend skills** auto-apply
- "Build a task creation form" → **Frontend Design** + **UI/UX Excellence** auto-apply
- "Why isn't this working?" → **Systematic Debugging** auto-applies

You'll notice Claude will:
1. Read relevant registry/config files first
2. Ask clarifying questions about requirements
3. Propose test cases and wait for approval
4. Write tests first, then implementation code
5. Follow design system for all UI work
6. Systematically debug (reproduce → understand → fix)
7. Validate end-to-end after changes

### Skill Priority Order

**Backend Work:**
1. **Portal Registry Guardrail** (highest - prevents hardcoding)
2. **TDD Superpowers** (ensures process quality)
3. **Backend Tests** (ensures coverage)
4. **Systematic Debugging** (when fixing bugs)

**Frontend Work:**
1. **Frontend Design** (enforces design system)
2. **UI/UX Excellence** (ensures great UX)
3. **Webapp Testing** (validates E2E flows)
4. **Systematic Debugging** (when fixing UI bugs)

### Overriding Skills

If you need to bypass a skill for a quick prototype or exploration:
- Say: "Skip skills for now, just show me the concept"
- For production code: Skills are mandatory and cannot be skipped
