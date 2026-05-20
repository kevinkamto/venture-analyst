# Venture Analyst - Portfolio Project Spec

## Stack

**Frontend:** Next.js (App Router) · Turbopack · shadcn/ui · Tailwind · Zustand · Framer Motion
**Backend:** FastAPI · Uvicorn · Pydantic v2 · OpenAI · SSE-Starlette · Loguru · Ruff · Mypy · Tavily

## Folder Structure

```
/
├── frontend/          ← Next.js App Router + Turbopack + shadcn/ui
└── backend/           ← FastAPI + Pydantic + Ruff + Mypy + Loguru
```

---

## 1. Backend Setup

### `backend/`

```
backend/
├── main.py
├── pyproject.toml          ← project metadata, uv deps, Ruff + Mypy config
├── lint.py                 ← ruff check --fix + ruff format + mypy
├── .env
├── agents/
│   ├── __init__.py
│   ├── base.py
│   ├── market_agent.py
│   ├── competitor_agent.py
│   ├── risk_agent.py
│   ├── monetisation_agent.py
│   └── synthesis_agent.py
├── core/
│   ├── orchestrator.py
│   ├── streaming.py
│   ├── tools.py
│   └── job_store.py
├── schemas/
│   ├── events.py           ← Pydantic SSE event models
│   ├── requests.py         ← Pydantic request models
│   └── responses.py        ← Pydantic response models
└── api/
    └── routes.py
```

### Install

```bash
cd backend
uv sync              # install runtime dependencies
uv sync --group dev  # also install ruff + mypy
```

### `.env`

```
OPENAI_API_KEY=your_key
TAVILY_API_KEY=your_key
```

### `pyproject.toml`

```toml
[project]
name = "venture-analyst-backend"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.136.1",
    "uvicorn[standard]>=0.46.0",
    "python-dotenv>=1.2.2",
    "openai>=2.36.0",
    "httpx>=0.28.1",
    "sse-starlette>=3.4.3",
    "tavily-python>=0.7.24",
    "pydantic>=2.0",
    "loguru>=0.7.3",
]

[dependency-groups]
dev = [
    "ruff>=0.15.12",
    "mypy>=2.0.0",
]

[tool.ruff]
line-length = 88

[tool.ruff.lint]
select = ["E", "F", "I", "UP", "B"]
ignore = ["E501"]

[tool.ruff.format]
quote-style = "double"

[tool.mypy]
python_version = "3.11"
strict = true
ignore_missing_imports = true
```

### `main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from api.routes import router

logger.add("logs/app.log", rotation="10 MB", retention="7 days", level="INFO")

app = FastAPI(title="Venture Analyst API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.on_event("startup")
async def startup() -> None:
    logger.info("Startup Validator API started")
```

### `api/routes.py`

```python
POST /api/validate          # ValidateRequest → { job_id: string }
GET  /api/stream/{job_id}   # SSE stream of AgentEvent
GET  /api/result/{job_id}   # → ValidationResult
```

### Pydantic Schemas - `schemas/`

```python
# schemas/events.py
from pydantic import BaseModel
from typing import Literal

AgentName = Literal[
    "market_research", "competitor", "risk",
    "monetisation", "synthesis", "system"
]
EventType = Literal[
    "thinking", "token", "tool_call",
    "tool_result", "complete", "error", "done"
]

class AgentEvent(BaseModel):
    agent: AgentName
    type: EventType
    data: str

# schemas/requests.py
class ValidateRequest(BaseModel):
    idea: str

# schemas/responses.py
class ValidationResult(BaseModel):
    job_id: str
    score: int
    verdict: str
    market: str
    competitors: str
    risks: str
    monetisation: str
    synthesis: str
```

### SSE Event Schema

Every streamed event is JSON with this shape:

```json
{ "agent": "market_research", "type": "thinking",  "data": "string" }
{ "agent": "competitor",      "type": "token",     "data": "string" }
{ "agent": "risk",            "type": "tool_call", "data": "web_search('...')" }
{ "agent": "monetisation",    "type": "complete",  "data": "full output string" }
{ "agent": "synthesis",       "type": "token",     "data": "string" }
{ "agent": "system",          "type": "done",      "data": "" }
{ "agent": "system",          "type": "error",     "data": "error message" }
```

Event types: `thinking` | `token` | `tool_call` | `tool_result` | `complete` | `error`

### `core/orchestrator.py` Logic

```python
async def run_validation(idea: str, job_id: str, queue: asyncio.Queue):
    # Step 1 - run 4 agents in parallel
    await asyncio.gather(
        run_market_agent(idea, queue),
        run_competitor_agent(idea, queue),
        run_risk_agent(idea, queue),
        run_monetisation_agent(idea, queue),
    )
    # Step 2 - synthesis agent after all complete
    await run_synthesis_agent(all_outputs, queue)
    # Step 3 - emit done
    await queue.put({ "agent": "system", "type": "done", "data": "" })
```

### `agents/base.py` Pattern

Every agent must:

- accept `idea: str` and `queue: asyncio.Queue[AgentEvent]`
- use `AgentEvent` Pydantic model for all emitted events
- use `logger.info` / `logger.error` from Loguru for internal logs
- emit `thinking` event before starting
- emit `tool_call` + `tool_result` when using web search
- stream tokens one by one via `token` events
- emit `complete` event with full output when done
- handle errors and emit `error` event with Loguru `logger.exception`
- all functions fully type-annotated for Mypy strict mode

### Agents

| Agent                  | Prompt Focus                                   | Uses Web Search |
| ---------------------- | ---------------------------------------------- | --------------- |
| `market_agent`       | Market size, trends, TAM, target users         | Yes             |
| `competitor_agent`   | Top competitors, gaps, positioning             | Yes             |
| `risk_agent`         | Legal, technical, market, execution risks      | No              |
| `monetisation_agent` | Revenue models, pricing strategy, channels     | No              |
| `synthesis_agent`    | Merge all outputs, score 0–100, final verdict | No              |

### `core/job_store.py`

Simple in-memory dict storing job status and final result:

```python
jobs = {}  # { job_id: { status, result, queue } }
```

Use `uuid4` for job IDs.

---

## 2. Frontend Setup

### `frontend/`

```
frontend/
├── package.json
├── next.config.ts          ← Turbopack enabled
├── tailwind.config.ts
├── components.json         ← shadcn/ui config
├── app/
│   ├── layout.tsx
│   ├── page.tsx                ← Landing
│   ├── validate/
│   │   └── page.tsx            ← Live agent dashboard
│   └── result/
│       └── [jobId]/
│           └── page.tsx        ← Final report
├── components/
│   ├── ui/                         ← shadcn/ui primitives (auto-generated)
│   ├── analysis/
│   │   ├── AgentOutputCard.tsx     ← uses shadcn Card + Badge
│   │   ├── AgentProgressList.tsx   ← sidebar agent status list
│   │   ├── ActivityFeed.tsx        ← uses shadcn ScrollArea
│   │   └── SynthesisOutput.tsx     ← uses shadcn Separator
│   ├── report/
│   │   └── ValidationScore.tsx     ← uses shadcn Progress
│   └── Markdown.tsx
├── hooks/
│   └── useAgentStream.ts
├── store/
│   └── agentStore.ts           ← Zustand
└── lib/
    └── api.ts
```

### Install

```bash
cd frontend
pnpm create next-app@latest . --typescript --tailwind --app --turbopack
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add card badge scroll-area progress separator button textarea
pnpm add zustand framer-motion
```

### `next.config.ts`

```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    turbo: {},       // Turbopack enabled
  },
}

export default nextConfig
```

### shadcn `components.json`

```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Zustand Store - `store/agentStore.ts`

```typescript
type AgentStatus = 'idle' | 'thinking' | 'active' | 'complete' | 'error'

type AgentState = {
  status: AgentStatus
  output: string
  toolCalls: string[]
  tokenCount: number
  elapsed: number
  startedAt: number | null
}

type LogEntry = {
  time: string
  agent: string
  type: string
  message: string
}

type Store = {
  agents: Record<string, AgentState>
  logs: LogEntry[]
  isRunning: boolean
  jobId: string | null
  appendToken: (agent: string, token: string) => void
  setStatus: (agent: string, status: AgentStatus) => void
  addToolCall: (agent: string, tool: string) => void
  addLog: (entry: LogEntry) => void
  reset: () => void
}
```

### SSE Hook - `hooks/useAgentStream.ts`

```typescript
export function useAgentStream(jobId: string | null) {
  // Connect to GET /api/stream/{jobId}
  // Parse each SSE event
  // Dispatch to Zustand store based on event.agent + event.type
  // On "done" → set isRunning false
  // On "error" → set agent error status
}
```

---

## 3. UI Design Direction

### Theme: **Warm Parchment Studio**

The UI should feel like a thoughtful analyst's workspace - warm, legible, and calm. Not a dark terminal or neon dashboard. Think a well-designed research report or a premium strategy consultant's tool. Light backgrounds, warm earth tones, serif display type.

### Colors

```css
--bg-base:        #FBF8F3;   /* warm off-white cream */
--bg-surface:     #F3EDE0;   /* warm beige - card/panel background */
--bg-elevated:    #E8DFC9;   /* deeper beige - elevated elements */
--border:         #CDBFA3;   /* tan/caramel border */
--accent-amber:   #9B6E2E;   /* warm amber brown - primary CTA, market agent */
--accent-teal:    #2E6B5A;   /* forest teal - complete state, monetisation agent */
--accent-rust:    #B84D26;   /* warm rust - errors, risk agent */
--accent-slate:   #4A5E72;   /* muted slate blue - thinking state, competitor agent */
--text-primary:   #251A0E;   /* very dark brown */
--text-secondary: #5A4230;   /* medium warm brown */
--text-muted:     #967860;   /* muted caramel */
```

### Typography

```
Display/Headlines: "Playfair Display" - serif, intellectual weight
Body/UI:           "DM Sans" - humanist sans, clean and approachable
Data/Logs:         "JetBrains Mono" - monospace only for token counts, log timestamps, IDs
```

Import via `next/font/google`.

### Animations (Framer Motion)

- Agent cards show a warm amber box-shadow when status is `active`
- Tokens stream in with a subtle fade-in
- Activity feed entries slide in from the left
- Status transitions are smooth (not instant)
- Page load: staggered reveal top to bottom
- Synthesis panel fades in with a gentle scale after parallel agents complete

### Agent Status Colors

```
idle      → --text-muted (#967860), no indicator
thinking  → --accent-slate (#4A5E72), slow pulse dot
active    → --accent-amber (#9B6E2E), fast pulse + warm box-shadow
complete  → --accent-teal (#2E6B5A), solid dot
error     → --accent-rust (#B84D26)
```

### Agent ↔ Accent Colour Mapping

```
market_research → accent-amber  (#9B6E2E)
competitor      → accent-slate  (#4A5E72)
risk            → accent-rust   (#B84D26)
monetisation    → accent-teal   (#2E6B5A)
synthesis       → accent-amber  (#9B6E2E)
```

---

## 4. Pages

### `app/page.tsx` - Landing

Layout:

- Full-screen warm cream background (`#FBF8F3`)
- Serif headline (Playfair Display): *"Is your idea worth building?"*
- Descriptive subtext explaining the five agents
- Single textarea input with warm beige background
- One CTA button in `#9B6E2E` amber brown
- Subtle dot-pattern background overlay
- On submit → POST `/api/validate` → redirect to `/validate?job={jobId}`

### `app/validate/page.tsx` - Live Dashboard

Two-column layout on desktop, stacked on mobile:

**Left column (flexible) - Agent Output Cards**

```
┌─────────────────┐  ┌─────────────────┐
│ Market Research │  │ Competitor Anal.│
│ [Active ●]      │  │ [Thinking ○]    │
│ streaming text… │  │ Thinking…       │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│ Risk Assessment │  │ Monetisation    │
│ [Done ✓]        │  │ [Idle]          │
│ output text…    │  │                 │
└─────────────────┘  └─────────────────┘

┌────────────────────────────────────────┐
│ Synthesis - Final Analysis             │
│ [streaming…]                           │
└────────────────────────────────────────┘
```

**Right column (280 px fixed) - Progress + Activity**

```
┌──────────────────────┐
│  Agents   2 running  │
├──────────────────────┤
│ ● Market Research    │
│   streaming · 12s    │
│ ○ Competitor         │
│   thinking · 6s      │
│ ✓ Risk               │
│   complete · 9s      │
│ - Monetisation       │
│   waiting            │
│ - Synthesis          │
│   waiting            │
├──────────────────────┤
│  Activity       live │
├──────────────────────┤
│ 12:03:01 market …   │
│ 12:03:02 comp   …   │
└──────────────────────┘
```

- Activity feed auto-scrolls, color-coded per agent
- Monospace font for timestamps/types only

### `app/result/[jobId]/page.tsx` - Final Report

```
┌────────────────────────────────────────┐
│  Validation Score            82 / 100  │
│  ████████████████████░░░░              │
│  Verdict: Promising                    │
└────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐
│ Market          │  │ Competitors     │
│ Opportunity     │  │                 │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│ Key Risks       │  │ Monetisation    │
│                 │  │ Strategy        │
└─────────────────┘  └─────────────────┘

┌────────────────────────────────────────┐
│ Synthesis - Executive Summary          │
└────────────────────────────────────────┘

        [ Analyse another idea → ]
```

---

## 5. API Client - `lib/api.ts`

```typescript
export const startValidation = async (idea: string): Promise<{ job_id: string }>
export const getResult = async (jobId: string): Promise<ResultData>
```

---

## 6. Build Order for Claude Code

### Step 1 - Backend Core

1. Create `backend/` structure
2. Set up `pyproject.toml` with Ruff + Mypy config
3. Implement `schemas/` (Pydantic models for events, requests, responses)
4. Implement `main.py` with CORS + Loguru setup
5. Implement `core/job_store.py`
6. Implement `core/streaming.py` (SSE helper)
7. Implement `api/routes.py` (3 typed endpoints)
8. Implement `agents/base.py` with full type annotations
9. Implement one agent end-to-end (`market_agent`)
10. Run `ruff check .` and `mypy .` - fix all errors
11. Test SSE stream works with one agent

### Step 2 - All Agents + Parallel

1. Implement remaining 3 parallel agents
2. Implement `core/orchestrator.py` with `asyncio.gather`
3. Implement `agents/synthesis_agent.py`
4. Run `ruff check .` and `mypy .` on all agents
5. Test full pipeline end-to-end

### Step 3 - Frontend Foundation

1. Create `frontend/` with Next.js + Turbopack
2. Run `npx shadcn@latest init` and add required components
3. Set up Tailwind CSS variables (warm parchment theme - no dark class)
4. Implement `store/agentStore.ts` (Zustand)
5. Implement `hooks/useAgentStream.ts`

### Step 4 - UI Pages

1. Build landing page (`app/page.tsx`)
2. Build agent dashboard (`app/validate/page.tsx`)
3. Build `components/analysis/AgentOutputCard.tsx` using shadcn `Card` + `Badge`
4. Build `components/analysis/AgentProgressList.tsx` - sidebar agent status list
5. Build `components/analysis/ActivityFeed.tsx` using shadcn `ScrollArea`
6. Build `components/analysis/SynthesisOutput.tsx` using shadcn `Separator`
7. Build `components/report/ValidationScore.tsx` using shadcn `Progress`
8. Build result page (`app/result/[jobId]/page.tsx`)

### Step 5 - Polish

1. Add Framer Motion animations
2. Agent warm box-shadow on active state
3. Token streaming fade-in effect
4. Mobile responsive layout
5. Error and loading states
6. Connect frontend to backend, end-to-end test

---

## 7. Key Rules for Claude Code

- Use `asyncio.gather` for parallel agents - never run sequentially
- Every agent must emit `thinking` before starting
- All backend functions must be fully type-annotated - Mypy strict must pass
- All backend code must pass `ruff check .` before commit
- Use Loguru `logger.info` for agent lifecycle events, `logger.error` for failures
- Use Pydantic `AgentEvent` model for every SSE event - never raw dicts
- SSE connection must stay open until `system.done` event
- Frontend must handle SSE reconnection on disconnect
- Use shadcn primitives (Card, Badge, ScrollArea, Progress) - do not rebuild them
- Turbopack must be enabled in `next.config.ts` - do not use webpack
- Do not fake streaming - every token comes from real LLM stream
- Tool calls must be visible in UI as they happen
- Synthesis agent only starts after ALL parallel agents emit `complete`
- No placeholder data - everything is real LLM output
- Theme is light (warm parchment) - never add `dark` class or dark-mode variables
- Fonts: Playfair Display (display), DM Sans (body), JetBrains Mono (data/logs only)
- Custom components live in `components/analysis/` and `components/report/`
