import asyncio
from typing import Any

from loguru import logger

from backend.agents.competitor_agent import run_competitor_agent
from backend.agents.market_agent import run_market_agent
from backend.agents.monetisation_agent import run_monetisation_agent
from backend.agents.risk_agent import run_risk_agent
from backend.agents.synthesis_agent import run_synthesis_agent
from backend.core import job_store
from backend.schemas.events import AgentEvent
from backend.schemas.responses import ValidationResult


async def run_validation(idea: str, job_id: str, queue: asyncio.Queue[Any]) -> None:
    logger.info(f"[orchestrator] starting job {job_id}")
    try:
        # Run 4 agents in parallel
        results = await asyncio.gather(
            run_market_agent(idea, queue),
            run_competitor_agent(idea, queue),
            run_risk_agent(idea, queue),
            run_monetisation_agent(idea, queue),
            return_exceptions=True,
        )

        market_out, competitor_out, risk_out, monetisation_out = (
            r if isinstance(r, str) else "" for r in results
        )

        # Synthesis after all parallel agents complete
        synthesis_out, score, verdict = await run_synthesis_agent(
            idea,
            market_out,
            competitor_out,
            risk_out,
            monetisation_out,
            queue,
        )

        result = ValidationResult(
            job_id=job_id,
            score=score,
            verdict=verdict,
            market=market_out,
            competitors=competitor_out,
            risks=risk_out,
            monetisation=monetisation_out,
            synthesis=synthesis_out,
        )
        job_store.set_result(job_id, result)

        done_event = AgentEvent(agent="system", type="done", data="")
        await queue.put(done_event)
        logger.info(f"[orchestrator] job {job_id} complete - score={score}")

    except Exception:
        logger.exception(f"[orchestrator] job {job_id} failed")
        error_event = AgentEvent(
            agent="system",
            type="error",
            data="Orchestrator encountered an unexpected error",
        )
        await queue.put(error_event)
