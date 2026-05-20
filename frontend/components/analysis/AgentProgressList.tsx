"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  useAgentStore,
  type AgentKey,
  AGENT_LABELS,
  PARALLEL_AGENTS,
} from "@/store/agentStore";

const STATUS_DOT: Record<string, string> = {
  idle: "bg-[#CDBFA3]",
  thinking: "bg-[#4A5E72] animate-pulse",
  active: "bg-[#9B6E2E] animate-pulse",
  complete: "bg-[#2E6B5A]",
  error: "bg-[#B84D26]",
};

const STATUS_TEXT: Record<string, string> = {
  idle: "text-[#CDBFA3]",
  thinking: "text-[#4A5E72]",
  active: "text-[#9B6E2E]",
  complete: "text-[#2E6B5A]",
  error: "text-[#B84D26]",
};

function useElapsed(startedAt: number | null): number | null {
  const [elapsed, setElapsed] = useState<number | null>(null);

  useEffect(() => {
    if (!startedAt) {
      setElapsed(null);
      return;
    }
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return elapsed;
}

function AgentRow({ agent }: { agent: AgentKey }) {
  const state = useAgentStore((s) => s.agents[agent]);
  const { status, toolCalls, tokenCount, startedAt } = state;
  const elapsed = useElapsed(startedAt);

  const statusLine = () => {
    if (status === "idle") return <span className="text-[#CDBFA3]">queued</span>;
    if (status === "thinking")
      return <span>thinking{elapsed !== null ? ` · ${elapsed}s` : ""}</span>;
    if (status === "active")
      return <span>streaming{elapsed !== null ? ` · ${elapsed}s` : ""}</span>;
    if (status === "complete")
      return <span>done{elapsed !== null ? ` · ${elapsed}s` : ""}</span>;
    return <span>failed</span>;
  };

  return (
    <motion.div
      layout
      className="flex flex-col gap-0.5 py-2.5 border-b border-[#E8DFC9] last:border-0"
    >
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full flex-none ${STATUS_DOT[status]}`} />
        <span className="font-sans text-xs font-semibold text-[#251A0E]">
          {AGENT_LABELS[agent]}
        </span>
      </div>
      <div className={`ml-4 font-sans text-[10px] ${STATUS_TEXT[status]}`}>
        {statusLine()}
      </div>
      {toolCalls.length > 0 && (
        <div className="ml-4 font-mono text-[10px] text-[#967860]">
          {toolCalls.length} tool call{toolCalls.length !== 1 ? "s" : ""}
        </div>
      )}
      {tokenCount > 0 && (
        <div className="ml-4 font-mono text-[10px] text-[#967860]">
          {tokenCount} tokens
        </div>
      )}
    </motion.div>
  );
}

export function AgentProgressList() {
  const agents = useAgentStore((s) => s.agents);
  const activeCount = Object.values(agents).filter(
    (a) => a.status === "active" || a.status === "thinking"
  ).length;

  const allKeys: AgentKey[] = [...PARALLEL_AGENTS, "synthesis"];

  return (
    <div className="rounded-xl border border-[#CDBFA3] bg-[#F3EDE0] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#E8DFC9] px-4 py-2.5">
        <span className="font-sans text-[11px] font-semibold text-[#967860] tracking-wide uppercase">
          Agents
        </span>
        {activeCount > 0 && (
          <span className="font-mono text-[11px] text-[#9B6E2E]">
            {activeCount} active
          </span>
        )}
      </div>
      <div className="overflow-y-auto max-h-60 px-4">
        {allKeys.map((key) => (
          <AgentRow key={key} agent={key} />
        ))}
      </div>
    </div>
  );
}
