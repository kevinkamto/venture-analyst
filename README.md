# Venture Analyst

AI-powered startup idea evaluation using five parallel agents.

| Thumbnail                                         | Final Result                                       |
| ------------------------------------------------- | -------------------------------------------------- |
| ![Venture Analyst](images/thumb.png "Venture Analyst") | ![Venture Analyst](images/ending.png "Venture Analyst") |

## Stack

- **Backend:** FastAPI · Pydantic v2 · OpenAI · SSE-Starlette · Loguru · Ruff · Mypy · Tavily
- **Frontend:** Next.js (App Router) · Turbopack · shadcn/ui · Tailwind · Zustand · Framer Motion

## Quick Start

### Prerequisites

- Python 3.11+ and [`uv`](https://docs.astral.sh/uv/)
- Node.js 18+ and [`pnpm`](https://pnpm.io/)
- OpenAI and Tavily API keys

### Backend

```bash
cd backend
uv sync                        # install all deps from uv.lock
uv sync --group dev            # also install ruff + mypy
cp .env.example .env           # then fill in your keys
uv run uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Visit `http://localhost:3000`.

## Environment

```env
# backend/.env
OPENAI_API_KEY=your_key
TAVILY_API_KEY=your_key
```

## Project Structure

```
backend/
├── main.py                   # FastAPI entry point
├── pyproject.toml            # project metadata + uv deps + ruff/mypy config
├── lint.py                   # ruff check --fix, ruff format, mypy
├── agents/
│   ├── base.py
│   ├── market_agent.py
│   ├── competitor_agent.py
│   ├── risk_agent.py
│   ├── monetisation_agent.py
│   └── synthesis_agent.py
├── core/
│   ├── orchestrator.py
│   ├── job_store.py
│   └── streaming.py
├── api/
│   └── routes.py
└── schemas/
    ├── events.py
    ├── requests.py
    └── responses.py

frontend/
├── app/
│   ├── page.tsx                      # Landing
│   ├── validate/page.tsx             # Live analysis dashboard
│   └── result/[jobId]/page.tsx       # Final report
├── components/
│   ├── analysis/
│   │   ├── AgentOutputCard.tsx
│   │   ├── AgentProgressList.tsx
│   │   ├── ActivityFeed.tsx
│   │   └── SynthesisOutput.tsx
│   ├── report/
│   │   └── ValidationScore.tsx
│   └── Markdown.tsx
├── store/agentStore.ts               # Zustand state
└── hooks/useAgentStream.ts           # SSE client
```

## API

| Method | Path                     | Description                  |
| ------ | ------------------------ | ---------------------------- |
| POST   | `/api/validate`        | Submit idea →`{ job_id }` |
| GET    | `/api/stream/{job_id}` | SSE stream of agent events   |
| GET    | `/api/result/{job_id}` | Final scored result          |

SSE event shape: `{ "agent": "market_research", "type": "token", "data": "..." }`

## Agents

| Agent           | Focus                                | Web Search |
| --------------- | ------------------------------------ | ---------- |
| Market Research | Market size, TAM, trends             | Yes        |
| Competitor      | Top competitors, positioning gaps    | Yes        |
| Risk            | Legal, technical, execution risks    | No         |
| Monetisation    | Revenue models, pricing strategy     | No         |
| Synthesis       | Merge outputs, score 0–100, verdict | No         |

The four analysis agents run in parallel via `asyncio.gather`. Synthesis starts only after all four emit `complete`.

## Code Quality

```bash
# from backend/
uv run python lint.py     # ruff check --fix + ruff format + mypy

# from frontend/
pnpm lint                 # ESLint
```

## Architecture

1. User submits an idea — `POST /api/validate` returns a `job_id`
2. Orchestrator spawns four agents concurrently
3. Each agent emits SSE events (thinking → tool_call → token → complete)
4. Frontend subscribes via `EventSource`, updates Zustand store in real time
5. Synthesis agent runs once all four parallel agents are complete
6. Final scored result available at `GET /api/result/{job_id}`
