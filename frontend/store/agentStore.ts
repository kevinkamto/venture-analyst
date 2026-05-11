import { create } from "zustand";

export type AgentStatus = "idle" | "thinking" | "active" | "complete" | "error";

export type AgentKey =
  | "market_research"
  | "competitor"
  | "risk"
  | "monetisation"
  | "synthesis";

export const AGENT_LABELS: Record<AgentKey, string> = {
  market_research: "Market Research",
  competitor: "Competitor Analysis",
  risk: "Risk Assessment",
  monetisation: "Monetisation",
  synthesis: "Synthesis",
};

export const PARALLEL_AGENTS: AgentKey[] = [
  "market_research",
  "competitor",
  "risk",
  "monetisation",
];

type AgentState = {
  status: AgentStatus;
  output: string;
  toolCalls: string[];
  tokenCount: number;
  startedAt: number | null;
};

export type LogEntry = {
  time: string;
  agent: string;
  type: string;
  message: string;
};

const defaultAgentState = (): AgentState => ({
  status: "idle",
  output: "",
  toolCalls: [],
  tokenCount: 0,
  startedAt: null,
});

type Store = {
  agents: Record<AgentKey, AgentState>;
  logs: LogEntry[];
  isRunning: boolean;
  jobId: string | null;

  setJobId: (id: string) => void;
  setRunning: (v: boolean) => void;
  appendToken: (agent: AgentKey, token: string) => void;
  setStatus: (agent: AgentKey, status: AgentStatus) => void;
  addToolCall: (agent: AgentKey, tool: string) => void;
  addLog: (entry: LogEntry) => void;
  reset: () => void;
};

const initialAgents = (): Record<AgentKey, AgentState> => ({
  market_research: defaultAgentState(),
  competitor: defaultAgentState(),
  risk: defaultAgentState(),
  monetisation: defaultAgentState(),
  synthesis: defaultAgentState(),
});

export const useAgentStore = create<Store>((set) => ({
  agents: initialAgents(),
  logs: [],
  isRunning: false,
  jobId: null,

  setJobId: (id) => set({ jobId: id }),
  setRunning: (v) => set({ isRunning: v }),

  appendToken: (agent, token) =>
    set((s) => ({
      agents: {
        ...s.agents,
        [agent]: {
          ...s.agents[agent],
          output: s.agents[agent].output + token,
          tokenCount: s.agents[agent].tokenCount + 1,
          status: "active" as AgentStatus,
        },
      },
    })),

  setStatus: (agent, status) =>
    set((s) => ({
      agents: {
        ...s.agents,
        [agent]: {
          ...s.agents[agent],
          status,
          startedAt:
            status === "thinking" && s.agents[agent].startedAt === null
              ? Date.now()
              : s.agents[agent].startedAt,
        },
      },
    })),

  addToolCall: (agent, tool) =>
    set((s) => ({
      agents: {
        ...s.agents,
        [agent]: {
          ...s.agents[agent],
          toolCalls: [...s.agents[agent].toolCalls, tool],
        },
      },
    })),

  addLog: (entry) =>
    set((s) => ({
      logs: [...s.logs.slice(-500), entry],
    })),

  reset: () =>
    set({
      agents: initialAgents(),
      logs: [],
      isRunning: false,
      jobId: null,
    }),
}));
