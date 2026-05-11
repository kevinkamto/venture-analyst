import asyncio
from typing import Any, cast
from uuid import uuid4

from backend.schemas.responses import ValidationResult

jobs: dict[str, dict[str, Any]] = {}


def create_job() -> str:
    job_id = str(uuid4())
    jobs[job_id] = {
        "status": "pending",
        "result": None,
        "queue": asyncio.Queue(),
    }
    return job_id


def get_job(job_id: str) -> dict[str, Any] | None:
    return jobs.get(job_id)


def get_queue(job_id: str) -> "asyncio.Queue[Any] | None":
    job = jobs.get(job_id)
    if job:
        return cast("asyncio.Queue[Any]", job["queue"])
    return None


def set_result(job_id: str, result: ValidationResult) -> None:
    if job_id in jobs:
        jobs[job_id]["status"] = "complete"
        jobs[job_id]["result"] = result


def get_result(job_id: str) -> ValidationResult | None:
    job = jobs.get(job_id)
    if job and job["result"] is not None:
        return cast(ValidationResult, job["result"])
    return None
