# ResearchBridge

AI-powered research lab entry kit for underrepresented undergraduates.

```mermaid
flowchart LR
    A[Intake Form] --> B[Transparent Pipeline]
    B --> C[Professor Matches]
    B --> D[Email Drafts]
    B --> E[Research Statement]
    B --> F[Grant Matches]
    B --> G[12-Week Plan]
```

## Stack

- `apps/web` - React + Tailwind
- `apps/api` - FastAPI + SSE
- `References` - PRD and design references

## Run

```bash
cd apps/api && python3 -m pip install -e . && uvicorn app.main:app --reload
cd apps/web && npm install && npm run dev
```

## Status

Working local product flow: landing, intake, live progress, results dashboard, glossary, history, export.

Live integrations are still seeded adapters for now.
