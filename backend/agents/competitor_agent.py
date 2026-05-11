import asyncio
from typing import Any

from loguru import logger

from backend.agents.base import emit, stream_llm_with_search
from backend.schemas.events import AgentName

SYSTEM_PROMPT = """You are a competitive intelligence analyst specializing in startup ecosystems.
Analyze the startup idea and provide a comprehensive competitor analysis covering:
- Top 5–8 direct competitors with brief descriptions
- Indirect competitors and substitute solutions
- Competitive landscape map (positioning, pricing tiers)
- Feature gap analysis — what competitors are missing
- Market share distribution (estimates)
- Competitor weaknesses and exploitable gaps
- Your recommended positioning strategy

Be specific about real companies and products. Use the research context provided."""

AGENT: AgentName = "competitor"


async def run_competitor_agent(idea: str, queue: asyncio.Queue[Any]) -> str:
    logger.info(f"[{AGENT}] starting")
    try:
        await emit(queue, AGENT, "thinking", "Mapping competitive landscape...")

        output = await stream_llm_with_search(
            AGENT,
            queue,
            SYSTEM_PROMPT,
            idea,
            [
                f"{idea} competitors alternatives 2024",
                f"{idea} startup landscape funding companies",
            ],
        )

        await emit(queue, AGENT, "complete", output)
        logger.info(f"[{AGENT}] complete")
        return output
    except Exception:
        logger.exception(f"[{AGENT}] failed")
        await emit(queue, AGENT, "error", "Competitor agent encountered an error")
        return ""
