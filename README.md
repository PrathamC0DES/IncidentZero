# IncidentZero: Autonomous SRE & Self-Healing Codebase Platform

IncidentZero is an autonomous Site Reliability Engineering (SRE) and bug-remediation agent platform. When a production service experiences an unhandled crash or exception, IncidentZero catches the incident via webhook, analyzes the root cause across the target codebase, reproduces the failure with a generated test case, validates a fix in an isolated sandbox, and automatically raises an audited GitHub Pull Request.

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
