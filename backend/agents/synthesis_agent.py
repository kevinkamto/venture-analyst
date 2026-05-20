import asyncio
import re
from typing import Any

from loguru import logger

from backend.agents.base import emit, stream_llm
from backend.schemas.events import AgentName

SYSTEM_PROMPT = """You are a senior venture capital analyst synthesizing a comprehensive startup validation report.

You will receive research from 4 specialist agents: Market Research, Competitor Analysis, Risk Assessment, and Monetisation Strategy.

Your task:
1. Synthesize all findings into a coherent final analysis
2. Identify the most critical insights and cross-cutting themes
3. Assign an overall **Validation Score from 0–100** based on:
   - Market opportunity (25 points)
   - Competitive differentiation (25 points)
   - Risk profile (25 points)
   - Monetisation viability (25 points)
4. Give a clear **Verdict**: one of: STRONG OPPORTUNITY / PROMISING / PROCEED WITH CAUTION / HIGH RISK / NOT RECOMMENDED
5. Provide 3 specific, actionable next steps for the founder

Format your response as follows:

VALIDATION SCORE: [number]/100
VERDICT: [verdict]

## Executive Summary
[2-3 paragraph synthesis]

## Key Strengths
[bullet points]

## Critical Concerns
[bullet points]

## Recommended Next Steps
1. [specific action]
2. [specific action]
3. [specific action]

Be direct, honest, and actionable. This is a founder's roadmap, not a marketing document."""


def _extract_score(text: str) -> int:
    match = re.search(r"VALIDATION SCORE:\s*(\d+)", text)
    if match:
        return min(100, max(0, int(match.group(1))))
    return 50


def _extract_verdict(text: str) -> str:
    match = re.search(
        r"VERDICT:\s*(STRONG OPPORTUNITY|PROMISING|PROCEED WITH CAUTION|HIGH RISK|NOT RECOMMENDED)",
        text,
    )
    if match:
        return match.group(1)
    return "PROCEED WITH CAUTION"


async def run_synthesis_agent(
    idea: str,
    market_output: str,
    competitor_output: str,
    risk_output: str,
    monetisation_output: str,
    queue: asyncio.Queue[Any],
) -> tuple[str, int, str]:
    agent: AgentName = "synthesis"
    logger.info(f"[{agent}] starting")
    try:
        await emit(
            queue,
            agent,
            "thinking",
            "Synthesizing all agent outputs into final report...",
        )

        user_prompt = f"""Startup idea: {idea}

## Market Research Agent Output:
{market_output}

## Competitor Analysis Agent Output:
{competitor_output}

## Risk Assessment Agent Output:
{risk_output}

## Monetisation Strategy Agent Output:
{monetisation_output}

Synthesize all of the above into a final validation report."""

        output = await stream_llm(agent, queue, SYSTEM_PROMPT, user_prompt)

        score = _extract_score(output)
        verdict = _extract_verdict(output)

        await emit(queue, agent, "complete", output)
        logger.info(f"[{agent}] complete - score={score}, verdict={verdict}")
        return output, score, verdict
    except Exception:
        logger.exception(f"[{agent}] failed")
        await emit(queue, agent, "error", "Synthesis agent encountered an error")
        return "", 0, "ERROR"
