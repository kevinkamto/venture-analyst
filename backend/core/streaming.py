import asyncio
import json
from collections.abc import AsyncGenerator
from typing import Any

from loguru import logger

from backend.schemas.events import AgentEvent


async def event_generator(
    queue: asyncio.Queue[Any],
) -> AsyncGenerator[dict[str, str], None]:
    while True:
        try:
            event: AgentEvent | None = await asyncio.wait_for(
                queue.get(), timeout=120.0
            )
        except TimeoutError:
            logger.warning("SSE stream timed out waiting for events")
            break

        if event is None:
            break

        yield {"data": json.dumps(event.model_dump())}

        if event.agent == "system" and event.type == "done":
            break
        if event.agent == "system" and event.type == "error":
            break
