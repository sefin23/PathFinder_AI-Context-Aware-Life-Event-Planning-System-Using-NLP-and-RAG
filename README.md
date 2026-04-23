<p align="center">
  <img src="pathfinder_logo.svg" alt="PathFinder AI Logo" width="90" />
</p>

<h1 align="center">PathFinder AI</h1>
<p align="center">A Context-Aware Life Event Planning System Using NLP and RAG</p>

---

Most life situations don't come with instructions. You type _"I'm finishing college and moving to a new city for my first job"_ — PathFinder AI reads the situation, asks a few smart questions if needed, and builds a personalised step-by-step plan covering documentation, accommodation, banking, and onboarding. Upload your offer letter and it reads the joining date, company, and location automatically — pre-filling your requirements so you never enter the same detail twice. Each task comes with the exact official link you need and a guided walkthrough that knows which documents you've already uploaded. As your situation changes, the plan adapts with it.

## Key Features

- 🧠 **Context-Aware Planning** — understands vague natural language input, not rigid forms. Covers 10 life domains: Housing, Work, Education, Health, Family, Finance, Legal, Parenting, Loss, and Personal Growth.
- ❓ **Smart Clarification** — asks follow-up questions only when the system's confidence in understanding the user's intent falls below a threshold, reducing cognitive load.
- ✅ **User-Controlled Approval** — AI proposes a full workflow before anything is saved. The user reviews, modifies, or rejects it. No irreversible actions without explicit approval.
- 🗺️ **Guide Me** — walks the user through any task step-by-step, automatically finding the right official links, checking their uploaded documents, and pre-filling personal details.
- 💬 **Ask Your Plan** — a context-aware floating chatbot that understands the user's specific tasks, uploaded documents, and local city/state rules.
- 📄 **Document Vault** — securely stores files and automatically reads information from them, pre-filling event requirements so the user never re-enters the same details twice.
- 📅 **Daily Planner** — lets users input personal schedules so the system detects clashes and reschedules tasks accordingly.
- 📊 **Analytics** — tracks task completion and progress across all active life events in one place.

## Design Philosophy

**Life-Event First, Not Task First** — tasks only make sense in context. A "Prepare documents" task is meaningless unless the system understands the underlying event. All workflows, deadlines, and reminders are scoped under a life event that can span days, months, or years.

**Progressive Clarification over Perfect Input** — users often cannot articulate all details at once, especially during stressful situations. The system accepts vague input and clarifies gradually instead of forcing structured forms upfront.

**AI Assists, Never Decides** — AI suggestions are always editable, optional, and labeled as recommendations. The user remains fully in control.

## Documentation

- [Life Events Library & Use Cases](LIFE_EVENTS_LIBRARY.md) — the 10 life event domains covered, real-world use cases, and target audience breakdown
- [Backend README](backend/README.md) — tech stack with reasoning, AI pipeline overview, and setup instructions
- [Frontend README](frontend/README.md) — frontend tech stack with reasoning and folder structure
