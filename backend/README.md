# PathFinder AI — Backend

The backend is a Python REST API that powers all the intelligence in PathFinder AI — understanding what the user types, retrieving relevant knowledge, generating personalised plans, and managing everything in the database.

## Tech Stack

| Technology | Why it was chosen |
|---|---|
| **FastAPI** | Async Python web framework. Chosen because LLM API calls can take 5–15 seconds — FastAPI handles other requests during that wait instead of blocking, keeping the app responsive for all users |
| **Uvicorn** | The ASGI server that runs FastAPI. Required for async support; standard WSGI servers like Gunicorn can't handle async properly |
| **SQLite + SQLAlchemy** | SQLite was chosen for zero-config local deployment — no database server to install or manage. SQLAlchemy provides a clean ORM layer so switching to PostgreSQL later only requires changing the connection string |
| **Pydantic** | Validates every API request and response automatically. If the frontend sends a bad payload, Pydantic rejects it with a clear error before it ever touches the database |
| **Google Gemini API** | Used for two things: (1) classifying the life event type from the user's text, and (2) generating 3072-dimensional embeddings for the RAG knowledge base retrieval |
| **OpenRouter** | A unified API gateway that provides access to multiple LLM providers (NVIDIA Nemotron, Qwen, Groq). Used as a fallback chain — if one model is slow or rate-limited, the next one takes over automatically |
| **NumPy** | Computes cosine similarity between the user's query embedding and the knowledge base embeddings entirely in-process. No external vector database needed |
| **APScheduler** | Runs background jobs (daily reminder checks, morning briefs) without needing a separate worker process like Celery |
| **python-dotenv** | Loads API keys from a `.env` file so credentials are never hardcoded in source code |

## Structure

```
backend/
├── main.py          # App entry point — registers all routes and starts the scheduler
├── database.py      # SQLAlchemy engine, session, and DB initialisation
├── config.py        # Loads all environment variables via python-dotenv
├── models/          # Database table definitions (User, LifeEvent, Task, VaultDocument, etc.)
├── schemas/         # Pydantic request/response shapes for each API endpoint
├── routes/          # API endpoints grouped by feature (auth, tasks, vault, workflow, etc.)
├── services/        # Core business logic (NLP, RAG retrieval, workflow generation, email)
├── scripts/         # Utility scripts (seed knowledge base, DB migration helpers)
└── data/            # Static data files (portal registry JSON)
```

## How the AI Pipeline Works

```
User types: "I'm moving to Pune for a new job"
        ↓
[NLP Service]         Gemini classifies → "Job Relocation" event type
        ↓
[RAG Service]         Embeds query → finds top-k knowledge chunks via cosine similarity
        ↓
[Workflow Generator]  Gemini generates structured task plan using ONLY retrieved chunks
        ↓
[Approval Route]      User reviews → clicks Approve → tasks saved to database
```

## Running Locally

```bash
# From the project root
pip install -r requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

API docs are available at `http://localhost:8000/docs` once the server is running.

## Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```
GEMINI_API_KEY=        # Google AI Studio — used for embeddings + NLP classification
OPENROUTER_API_KEY=    # OpenRouter — used for workflow generation LLM calls
NVIDIA_API_KEY=        # NVIDIA NIM — primary high-quality model
GROQ_API_KEY=          # Groq — fast fallback model
SMTP_USER=             # Gmail address for sending email reminders
SMTP_PASSWORD=         # Gmail app password (not your account password)
```
