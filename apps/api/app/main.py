from __future__ import annotations

import asyncio
from datetime import datetime
from typing import AsyncIterator
from uuid import UUID

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, StreamingResponse

from app.data.catalog import GLOSSARY, UNIVERSITIES
from app.models import (
    PipelineEvent,
    PipelineRun,
    PipelineStatus,
    StepStatus,
    StudentProfileInput,
)
from app.services.pipeline import RUN_HISTORY, RUN_STORE, build_history_item, build_run


app = FastAPI(title="ResearchBridge API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_run_or_404(run_id: UUID) -> PipelineRun:
    run = RUN_STORE.get(run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Pipeline run not found.")
    return run


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/universities")
def universities(q: str = Query(default="", min_length=0, max_length=120)):
    if not q:
        return UNIVERSITIES
    query = q.lower()
    return [item for item in UNIVERSITIES if query in item.name.lower()]


@app.get("/api/glossary")
def glossary():
    return GLOSSARY


@app.get("/api/history")
def history():
    return RUN_HISTORY[:10]


@app.post("/api/pipeline/start")
def start_pipeline(payload: StudentProfileInput) -> dict[str, str]:
    run = build_run(payload)
    RUN_STORE[run.id] = run
    return {"run_id": str(run.id)}


@app.get("/api/pipeline/{run_id}")
def get_pipeline(run_id: UUID):
    return get_run_or_404(run_id)


async def event_stream(run: PipelineRun) -> AsyncIterator[str]:
    if run.status == PipelineStatus.COMPLETED:
        complete_event = PipelineEvent(
            event="complete",
            step_id=None,
            progress=100,
            message="Research kit already completed.",
            run_status=PipelineStatus.COMPLETED,
            generated_at=datetime.utcnow(),
        )
        yield f"data: {complete_event.model_dump_json()}\n\n"
        return

    run.status = PipelineStatus.RUNNING
    for step in run.steps:
        step.status = StepStatus.RUNNING
        started = PipelineEvent(
            event="step_started",
            step_id=step.id,
            progress=max(step.progress - 10, 0),
            message=step.description,
            run_status=run.status,
            generated_at=datetime.utcnow(),
        )
        yield f"data: {started.model_dump_json()}\n\n"
        await asyncio.sleep(0.8)

        step.status = StepStatus.COMPLETED
        completed = PipelineEvent(
            event="step_completed",
            step_id=step.id,
            progress=step.progress,
            message=step.detail or step.description,
            run_status=run.status,
            generated_at=datetime.utcnow(),
        )
        yield f"data: {completed.model_dump_json()}\n\n"
        await asyncio.sleep(0.35)

    run.status = PipelineStatus.COMPLETED
    RUN_HISTORY.insert(0, build_history_item(run))
    complete_event = PipelineEvent(
        event="complete",
        step_id=None,
        progress=100,
        message="Research kit complete.",
        run_status=run.status,
        generated_at=datetime.utcnow(),
    )
    yield f"data: {complete_event.model_dump_json()}\n\n"


@app.get("/api/pipeline/{run_id}/events")
async def pipeline_events(run_id: UUID):
    run = get_run_or_404(run_id)
    return StreamingResponse(event_stream(run), media_type="text/event-stream")


@app.get("/api/pipeline/{run_id}/export", response_class=HTMLResponse)
def export_run(run_id: UUID):
    run = get_run_or_404(run_id)
    if run.result is None:
        raise HTTPException(status_code=409, detail="Kit is not available yet.")

    result = run.result
    professor_cards = "".join(
        [
            (
                f"<li><strong>{item.professor.name}</strong> - {item.professor.department} "
                f"({item.professor.match_score}% match)<br>{item.professor.research_summary}</li>"
            )
            for item in result.matched_professors
        ]
    )
    grant_cards = "".join(
        [f"<li><strong>{grant.name}</strong> - {grant.amount} - deadline {grant.deadline.isoformat()}</li>" for grant in result.grant_matches]
    )
    return f"""
    <html>
      <head>
        <title>ResearchBridge Kit Export</title>
        <style>
          body {{ font-family: Arial, sans-serif; color: #191c1d; padding: 40px; line-height: 1.6; }}
          h1, h2 {{ color: #022448; }}
          .section {{ margin-bottom: 28px; }}
        </style>
      </head>
      <body>
        <h1>ResearchBridge Kit for {result.profile.full_name}</h1>
        <div class="section">
          <h2>Matched Professors</h2>
          <ul>{professor_cards}</ul>
        </div>
        <div class="section">
          <h2>Research Statement</h2>
          <p>{result.research_statement.replace(chr(10), "</p><p>")}</p>
        </div>
        <div class="section">
          <h2>Grant Matches</h2>
          <ul>{grant_cards}</ul>
        </div>
      </body>
    </html>
    """
