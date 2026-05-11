from typing import Literal

from pydantic import BaseModel

AgentName = Literal[
    "market_research", "competitor", "risk", "monetisation", "synthesis", "system"
]
EventType = Literal[
    "thinking", "token", "tool_call", "tool_result", "complete", "error", "done"
]


class AgentEvent(BaseModel):
    agent: AgentName
    type: EventType
    data: str
