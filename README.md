# Startup Validator Agent

AI-powered validation for startup ideas using 5 parallel agents.

|Thumbnail|Final Result|
|---|---|
|![Startup Validator Agent](images/thumb.png "Startup Validator Agent")|![Startup Validator Agent](images/ending.png "Startup Validator Agent")|

![Running](images/running.gif "Running")

## Stack

- **Backend:** FastAPI · Pydantic v2 · OpenAI · SSE-Starlette · Loguru · Ruff · Mypy · Tavily
- **Frontend:** Next.js (App Router) · Turbopack · shadcn/ui · Tailwind · Zustand · Framer Motion

## Quick Start

### Prerequisites

Python 3.11+, Node.js 18+, `uv` and `pnpm` package managers
API keys: OpenAI and Tavily

### Setup

**Backend:**

```bash
cd backend && uv venv && source .venv/bin/activate
uv pip install -r requirements.txt
```

**Frontend:**

```bash
cd frontend && pnpm install
```

Create `backend/.env`:

```env
OPENAI_API_KEY=your_key
TAVILY_API_KEY=your_key
```

### Run

**Terminal 1:**

```bash
cd backend && source .venv/bin/activate && uvicorn main:app --reload
```

**Terminal 2:**

```bash
cd frontend && pnpm dev
```

Visit `http://localhost:3000`

## Folder Structure

```
backend/
├── main.py                  # FastAPI app
├── agents/                  # 5 AI agents
│   ├── market_agent.py
│   ├── competitor_agent.py
│   ├── risk_agent.py
│   ├── monetisation_agent.py
│   └── synthesis_agent.py
├── core/                    # Orchestration & streaming
│   ├── orchestrator.py
│   ├── job_store.py
│   └── streaming.py
├── api/routes.py            # API endpoints
└── schemas/                 # Pydantic models

frontend/
├── app/
│   ├── page.tsx             # Landing
│   ├── validate/page.tsx    # Live dashboard
│   └── result/[jobId]/page.tsx  # Results
├── components/
│   ├── AgentCard.tsx
│   ├── AgentStatusPanel.tsx
│   ├── LogPanel.tsx
│   ├── ScoreCard.tsx
│   └── SynthesisPanel.tsx
├── store/agentStore.ts      # Zustand state
└── hooks/useAgentStream.ts  # SSE streaming
```

## API Endpoints

**POST `/api/validate`** — Start validation
Request: `{ "idea": "..." }` → Response: `{ "job_id": "uuid" }`

**GET `/api/stream/{job_id}`** — SSE stream of agent events
Events: `{ "agent": "market_research", "type": "token", "data": "..." }`

**GET `/api/result/{job_id}`** — Final validation result
Response: `{ "job_id": "...", "score": 82, "verdict": "STRONG", "market": "...", ... }`

## Agents

| Agent           | Focus                          | Web Search |
| --------------- | ------------------------------ | ---------- |
| Market Research | Market size, TAM, trends       | ✅ Yes     |
| Competitor      | Top competitors, gaps          | ✅ Yes     |
| Risk            | Legal, technical, market risks | ❌ No      |
| Monetisation    | Revenue models, pricing        | ❌ No      |
| Synthesis       | Merge outputs, score 0-100     | ❌ No      |

All 4 agents run in parallel. Synthesis runs after they complete.

## Architecture

**Flow:**

1. User submits startup idea via POST `/api/validate`
2. Backend creates job ID and starts orchestrator
3. 4 agents run in parallel, emit SSE events to `/api/stream/{job_id}`
4. Frontend connects via EventSource, updates Zustand store
5. After all agents complete, synthesis agent runs
6. Final result available at `/api/result/{job_id}`

**State Management:** Zustand on frontend tracks agent status, output, and logs in real-time.

## Code Quality

```bash
# Backend
ruff check .      # Linting
ruff format .     # Formatting
mypy .            # Type checking (strict mode)

# Frontend
pnpm lint         # ESLint
```

## Environment

```env
# backend/.env
OPENAI_API_KEY=your_key
TAVILY_API_KEY=your_key

# frontend/.env.local (optional)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 🤝 Contributing

This is a portfolio project. To extend or modify:

1. **Backend changes:** Ensure `ruff check .` and `mypy .` pass
2. **Frontend changes:** Ensure `pnpm lint` passes
3. **New agents:** Follow the pattern in `agents/base.py`
4. **Type annotations:** Backend functions must be fully typed for Mypy strict mode

## 📖 Architecture Documentation

For detailed architecture and implementation decisions, see:

- **[CLAUDE.md](./CLAUDE.md)** — Complete project specification
- **Backend README** — Backend-specific setup and patterns
- **Frontend CLAUDE.md** — Frontend-specific design guidelines

## 📄 License

This is a portfolio project. Feel free to use as reference or starting point for your own projects.

## 🙋 Support

For issues or questions:

1. Check the project specification in `CLAUDE.md`
2. Review agent implementations in `backend/agents/`
3. Check frontend components in `frontend/components/`

## 🎯 Next Steps

- [ ] Add comprehensive test suites for agents
- [ ] Implement PDF export for validation results
- [ ] Add caching for repeated analyses
- [ ] Create admin dashboard for monitoring jobs
- [ ] Add user authentication and job history
- [ ] Deploy to production (Vercel + Railway)

---

**Built with ❤️ as a full-stack portfolio project**
