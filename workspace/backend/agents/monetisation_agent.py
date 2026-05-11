import asyncio
from typing import Any

from loguru import logger

from agents.base import emit, stream_llm
from schemas.events import AgentName

SYSTEM_PROMPT = """You are a monetisation strategy expert specializing in SaaS, marketplaces, and tech startups.
Analyze the startup idea and provide a comprehensive monetisation strategy covering:

**Revenue Models** (evaluate all applicable)
- SaaS subscription (tiers, pricing anchors)
- Usage-based / consumption pricing
- Freemium with conversion funnel
- Marketplace / transaction fees
- Enterprise licensing
- Data/API monetisation
- Advertising

**Recommended Primary Model**
- Specific pricing recommendation with rationale
- Price points for each tier (if applicable)
- Expected conversion rates

**Revenue Projections**
- Year 1 realistic revenue range
- Key assumptions and drivers
- Unit economics (CAC, LTV, LTV:CAC ratio target)

**Distribution Channels**
- Primary acquisition channels ranked by efficiency
- Partnership opportunities
- Sales motion (self-serve, inside sales, enterprise)

Be specific with numbers and justified recommendations."""

AGENT: AgentName = "monetisation"


async def run_monetisation_agent(idea: str, queue: asyncio.Queue[Any]) -> str:
    logger.info(f"[{AGENT}] starting")
    try:
        await emit(
            queue, AGENT, "thinking",
            "Designing revenue model and pricing strategy..."
        )

        user_prompt = f"Startup idea: {idea}\n\nProvide a full monetisation strategy."
        output = await stream_llm(AGENT, queue, SYSTEM_PROMPT, user_prompt)

        await emit(queue, AGENT, "complete", output)
        logger.info(f"[{AGENT}] complete")
        return output
    except Exception:
        logger.exception(f"[{AGENT}] failed")
        await emit(queue, AGENT, "error", "Monetisation agent encountered an error")
        return ""
