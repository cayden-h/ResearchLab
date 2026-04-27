# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project

ResearchBridge is a prototype that turns an undergraduate's intake form into a "research kit" (faculty matches, cold-email drafts, research statement, grant matches, 12-week onboarding plan). The system is a two-app monorepo with a React frontend and a FastAPI backend; live integrations are intentionally stubbed by seeded adapters.

## Commands

Backend ([apps/api](apps/api/), Python ≥ 3.11):

```bash
cd apps/api
python -m pip install -e .
uvicorn app.main:app --reload   # serves on http://localhost:8000
```

Frontend ([apps/web](apps/web/), Vite + React 18 + TS):

```bash
cd apps/web
npm install
npm run dev       # http://localhost:5173, expects API at :8000
npm run build     # tsc -b && vite build
npm run preview
```

The frontend reads `VITE_API_BASE_URL` (defaults to `http://localhost:8000`). The API CORS allow-list is hard-coded to the Vite dev origins in [apps/api/app/main.py](apps/api/app/main.py) — add new origins there if the web app moves.

There is no test suite, linter, or formatter configured in either app.

## Architecture

### End-to-end flow

1. Web posts a `StudentProfileInput` to `POST /api/pipeline/start`. The server **synchronously builds the entire `KitResult`** in [build_run](apps/api/app/services/pipeline.py) and stores it in the in-memory `RUN_STORE` under a new UUID, returning `{run_id}`.
2. Web navigates to `/pipeline/:runId` and opens `GET /api/pipeline/{run_id}/events` (SSE). The handler walks the precomputed `steps` list, flipping each from `running`→`completed` with `asyncio.sleep` between events. **The SSE stream is purely a UX timeline replay** — no work happens during streaming, results already exist.
3. On the `complete` event the web client navigates to `/results/:runId`, which calls `GET /api/pipeline/{run_id}` and renders the cached `KitResult`.
4. `GET /api/pipeline/{run_id}/export` returns a self-contained printable HTML page assembled inline in [main.py](apps/api/app/main.py).

Two consequences worth knowing before changing things:

- **State is in-process dicts** (`RUN_STORE`, `RUN_HISTORY` in [pipeline.py](apps/api/app/services/pipeline.py)). Restarting uvicorn loses runs; running multiple workers breaks lookups. Any persistence work needs to replace those module-level singletons.
- **Replaying `/events` mutates step status** on the stored run. Re-opening the SSE endpoint after completion short-circuits with a single `complete` event (see the early-return in [event_stream](apps/api/app/main.py)).

### Backend layout

- [app/models.py](apps/api/app/models.py) — Pydantic models shared across handlers; `StudentProfileInput` is the request schema, `KitResult` the response payload, `PipelineEvent` the SSE frame.
- [app/services/pipeline.py](apps/api/app/services/pipeline.py) — All "AI" logic: keyword extraction, faculty scoring, email/statement templating, grant filtering, 12-week plan generation. These are deterministic functions over the seeded catalog — there is no model call.
- [app/data/catalog.py](apps/api/app/data/catalog.py) — Seed data: `FACULTY_CATALOG`, `GRANTS_CATALOG`, `UNIVERSITIES`, `GLOSSARY`. Faculty matching depends on this exact shape (`tags`, `papers`, `openings`, `opportunities`, `email`).

### Frontend layout

- [src/App.tsx](apps/web/src/App.tsx) — Routes for landing, intake, pipeline (SSE view), results, glossary, history, wrapped in [AppShell](apps/web/src/components/AppShell.tsx).
- [src/lib/api.ts](apps/web/src/lib/api.ts) — Thin `fetch` wrapper; SSE is consumed via `EventSource` directly in [PipelinePage](apps/web/src/pages/PipelinePage.tsx).
- [src/lib/types.ts](apps/web/src/lib/types.ts) — Hand-maintained mirror of the Pydantic models. Changing a model on the API requires editing this file too; there is no codegen.
- Styling is Tailwind via [tailwind.config.js](apps/web/tailwind.config.js); brand color tokens live there.

## References folder

[References/](References/) holds the PRD (`ResearchBridge_PRD.docx`) and design screenshots for each surface (intake, pipeline progress, results dashboard, etc.). Consult these when changing UX copy or layouts — they are the source of truth for product intent, not the README.
