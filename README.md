# IncidentZero: Autonomous SRE & Self-Healing Codebase Platform

IncidentZero is an autonomous Site Reliability Engineering (SRE) and bug-remediation agent platform. When a production service experiences an unhandled crash or exception, IncidentZero catches the incident via webhook, analyzes the root cause across the target codebase, reproduces the failure with a generated test case, validates a fix in an isolated sandbox, and automatically raises an audited GitHub Pull Request.

## Interactive frontend demo

Use Node.js 20.19+ on the Node 20 line, or Node.js 22.12+. Run these commands from the repository root.

```sh
cd frontend
npm ci
npm run dev
```

Open [the Vite preview](http://localhost:5173/). The demo runs without the backend. Move the pointer to warp the ASCII field and click or tap to generate overlapping shockwaves. Focus **Emit pulse** and press Enter to emit from the center, or choose **Pause motion** to freeze the field.

The demo uses Three.js and WebGL 2 for its shaders, and GSAP for the caption entrance. It renders a still field when motion is reduced or WebGL 2 is unavailable. Run `npm run build` from `frontend` to produce the production bundle.

## Architecture & Technology Stack
- **API & Orchestrator:** FastAPI (Python 3.13) + Async I/O
- **Agent Framework:** LangGraph / StateGraph multi-agent loop with cycle detection & token guardrails
- **Database & Persistence:** PostgreSQL / SQLite (via SQLAlchemy 2.0 Async + Alembic)
- **Real-Time Streaming:** Server-Sent Events (SSE) / WebSockets
- **Frontend Dashboard:** Next.js / React (TypeScript) + Tailwind CSS + Lucide Icons
- **Isolation Sandbox:** Docker / subprocess test execution runner
- **VCS & Telemetry Integrations:** GitHub REST API (Automated PRs), Webhook Ingestion

## Milestone Roadmap
- [x] Workspace Initialization & Environment Setup
- [ ] Milestone 1: Core Domain Models & Incident Ingestion Engine
- [ ] Milestone 2: Multi-Agent State Machine (Investigator, Reproducer, Fixer, Auditor)
- [ ] Milestone 3: Sandboxed Execution & Self-Correction Loop
- [ ] Milestone 4: GitHub PR Automation & Live SSE Streaming API
- [ ] Milestone 5: Modern Dashboard UI & Cloud Deployment
