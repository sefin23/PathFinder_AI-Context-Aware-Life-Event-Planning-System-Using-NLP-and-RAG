# PathFinder AI — Frontend

The frontend is a single-page React application that serves as the user interface for PathFinder AI. It handles everything the user sees and interacts with — from typing a life event to viewing their personalised action plan.

## Tech Stack

| Technology | Why it was chosen |
|---|---|
| **React 19** | Component-based architecture makes it easy to build complex, interactive UIs like the task dashboard, vault, and settings — each as an isolated, reusable piece |
| **Vite** | Much faster development server than Create React App. Hot Module Replacement (HMR) means the browser updates instantly while coding without a full page reload |
| **Tailwind CSS** | Utility-first styling that keeps design consistent across all pages without writing separate CSS files for every component |
| **Framer Motion** | Smooth, hardware-accelerated animations — used for the workflow approval slide-in, task expand/collapse, and page transitions. Improves perceived quality significantly |
| **Lucide React** | A clean, consistent icon library. Avoids the bloat of Font Awesome while providing every icon needed (navigation, status indicators, actions) |

## Structure

```
frontend/
├── public/          # Static assets (login background, favicon)
├── src/
│   ├── api/         # All backend API calls in one place (backend.js)
│   ├── components/  # Reusable UI pieces (Sidebar, TaskCard, GuidePanel, etc.)
│   └── pages/       # Full page views (Dashboard, Vault, Settings, etc.)
├── index.html
├── package.json
└── vite.config.js
```

## Running Locally

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` and connects to the backend at `http://localhost:8000`.
