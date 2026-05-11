import asyncio
from typing import Any

from loguru import logger

from agents.base import emit, stream_llm
from schemas.events import AgentName

SYSTEM_PROMPT = """You are a startup risk assessment specialist.
Analyze the startup idea and identify all material risks across four dimensions:

**Legal & Regulatory Risks**
- Compliance requirements, licensing, data privacy (GDPR, CCPA)
- Industry-specific regulations, potential legal challenges

**Technical Risks**
- Build complexity, scalability challenges, technical debt risk
- Dependency on third-party APIs or infrastructure
- Security and data protection challenges

**Market Risks**
- Market timing (too early/too late), adoption curve challenges
- Customer acquisition difficulty, churn risk
- Pricing sensitivity, willingness to pay uncertainty

**Execution Risks**
- Team requirements and talent gaps
- Burn rate and runway requirements
- Go-to-market complexity

For each risk, rate severity (High/Medium/Low) and provide a mitigation strategy.
Be honest and thorough — founders need real warnings, not false comfort."""

AGENT: AgentName = "risk"


async def run_risk_agent(idea: str, queue: asyncio.Queue[Any]) -> str:
    logger.info(f"[{AGENT}] starting")
    try:
        await emit(
            queue, AGENT, "thinking",
            "Assessing legal, technical, market, and execution risks..."
        )

        user_prompt = f"Startup idea: {idea}\n\nProvide a full risk assessment."
        output = await stream_llm(AGENT, queue, SYSTEM_PROMPT, user_prompt)

        await emit(queue, AGENT, "complete", output)
        logger.info(f"[{AGENT}] complete")
        return output
    except Exception:
        logger.exception(f"[{AGENT}] failed")
        await emit(queue, AGENT, "error", "Risk agent encountered an error")
        return ""
