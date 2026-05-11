import asyncio
from typing import Any

from loguru import logger

from backend.agents.base import emit, stream_llm_with_search
from backend.schemas.events import AgentName

SYSTEM_PROMPT = """You are a senior market research analyst specializing in startup evaluation.
Analyze the startup idea and provide a comprehensive market analysis covering:
- Total Addressable Market (TAM) with size estimates in USD
- Serviceable Addressable Market (SAM) and Serviceable Obtainable Market (SOM)
- Target customer segments and detailed user personas
- Market trends and growth trajectory (CAGR where relevant)
- Key market drivers, tailwinds, and headwinds
- Geographic opportunities and market maturity
- Timing assessment — is now the right time?

Be specific with numbers and cite data from the research context provided."""

AGENT: AgentName = "market_research"


async def run_market_agent(idea: str, queue: asyncio.Queue[Any]) -> str:
    logger.info(f"[{AGENT}] starting")
    try:
        await emit(
            queue, AGENT, "thinking", "Researching market size, TAM, and trends..."
        )

        output = await stream_llm_with_search(
            AGENT,
            queue,
            SYSTEM_PROMPT,
            idea,
            [
                f"{idea} market size TAM 2024 2025",
                f"{idea} target customers user research trends",
                f"{idea} industry growth forecast",
            ],
        )

        await emit(queue, AGENT, "complete", output)
        logger.info(f"[{AGENT}] complete")
        return output
    except Exception:
        logger.exception(f"[{AGENT}] failed")
        await emit(queue, AGENT, "error", "Market research agent encountered an error")
        return ""
