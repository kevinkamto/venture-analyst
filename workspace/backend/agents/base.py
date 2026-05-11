import asyncio
import os
from typing import Any

from loguru import logger
from openai import AsyncOpenAI
from tavily import AsyncTavilyClient

from schemas.events import AgentEvent, AgentName

_openai_client: AsyncOpenAI | None = None
_tavily_client: AsyncTavilyClient | None = None


def get_openai() -> AsyncOpenAI:
    global _openai_client
    if _openai_client is None:
        _openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _openai_client


def get_tavily() -> AsyncTavilyClient:
    global _tavily_client
    if _tavily_client is None:
        _tavily_client = AsyncTavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
    return _tavily_client


async def emit(
    queue: asyncio.Queue[Any],
    agent: AgentName,
    event_type: str,
    data: str,
) -> None:
    event = AgentEvent(agent=agent, type=event_type, data=data)  # type: ignore[arg-type]
    await queue.put(event)


async def web_search(query: str) -> str:
    result = await get_tavily().search(query, max_results=5)
    snippets: list[str] = [
        r.get("content", "") for r in result.get("results", [])
    ]
    return "\n\n".join(snippets)


async def stream_llm(
    agent: AgentName,
    queue: asyncio.Queue[Any],
    system_prompt: str,
    user_prompt: str,
) -> str:
    full_output = ""
    stream = await get_openai().chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        stream=True,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            full_output += delta
            await emit(queue, agent, "token", delta)
    return full_output


async def stream_llm_with_search(
    agent: AgentName,
    queue: asyncio.Queue[Any],
    system_prompt: str,
    idea: str,
    search_queries: list[str],
) -> str:
    search_context = ""

    for query in search_queries:
        await emit(queue, agent, "tool_call", f"web_search('{query}')")
        logger.info(f"[{agent}] web_search: {query}")
        try:
            result = await web_search(query)
            search_context += f"\n\n## Search: {query}\n{result}"
            await emit(queue, agent, "tool_result", f"Results retrieved for: {query}")
        except Exception:
            logger.exception(f"[{agent}] web_search failed: {query}")
            await emit(queue, agent, "tool_result", f"Search failed for: {query}")

    user_prompt = f"Startup idea: {idea}\n\nResearch context:{search_context}"
    return await stream_llm(agent, queue, system_prompt, user_prompt)
