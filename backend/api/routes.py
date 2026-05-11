import asyncio
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException
from loguru import logger
from sse_starlette.sse import EventSourceResponse

from backend.core import job_store, orchestrator
from backend.core.streaming import event_generator
from backend.schemas.requests import ValidateRequest
from backend.schemas.responses import ValidationResult

router = APIRouter()


@router.post("/validate")
async def start_validation(
    request: ValidateRequest,
    background_tasks: BackgroundTasks,
) -> dict[str, str]:
    job_id = job_store.create_job()
    queue: asyncio.Queue[Any] = job_store.get_queue(job_id)  # type: ignore[assignment]
    background_tasks.add_task(orchestrator.run_validation, request.idea, job_id, queue)
    logger.info(f"Started validation job {job_id}")
    return {"job_id": job_id}


@router.get("/stream/{job_id}")
async def stream_events(job_id: str) -> EventSourceResponse:
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    queue: asyncio.Queue[Any] = job["queue"]
    return EventSourceResponse(event_generator(queue))


@router.get("/result/{job_id}", response_model=ValidationResult)
async def get_result(job_id: str) -> ValidationResult:
    result = job_store.get_result(job_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not ready")
    return result
