"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  useAgentStore,
  type AgentKey,
  AGENT_LABELS,
  PARALLEL_AGENTS,
} from "@/store/agentStore";

const STATUS_ICON: Record<string, string> = {
  idle: "○",
  thinking: "◌",
  active: "◉",
  complete: "◈",
  error: "✕",
};

const STATUS_COLOR: Record<string, string> = {
  idle: "#484F58",
  thinking: "#388BFD",
  active: "#00FF88",
  complete: "#00FF88",
  error: "#F85149",
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
  const color = STATUS_COLOR[status];

  const statusLabel = () => {
    if (status === "idle") return <span className="text-[#484F58]">waiting</span>;
    if (status === "thinking")
      return <span>thinking{elapsed !== null ? ` · ${elapsed}s` : ""}</span>;
    if (status === "active")
      return <span>streaming{elapsed !== null ? ` · ${elapsed}s` : ""}</span>;
    if (status === "complete")
      return <span>complete{elapsed !== null ? ` · ${elapsed}s` : ""}</span>;
    return <span>error</span>;
  };

  return (
    <motion.div
      layout
      className="flex flex-col gap-0.5 py-3 border-b border-[#21262D] last:border-0"
    >
      <div className="flex items-center gap-2">
        <span
          className={`font-mono text-base ${status === "thinking" || status === "active" ? "animate-pulse" : ""}`}
          style={{ color }}
        >
          {STATUS_ICON[status]}
        </span>
        <span className="font-mono text-xs font-semibold text-[#E6EDF3]">
          {AGENT_LABELS[agent]}
        </span>
      </div>
      <div className="ml-6 font-mono text-[10px]" style={{ color }}>
        {statusLabel()}
      </div>
      {toolCalls.length > 0 && (
        <div className="ml-6 font-mono text-[10px] text-[#484F58]">
          {toolCalls.length} tool call{toolCalls.length !== 1 ? "s" : ""}
        </div>
      )}
      {tokenCount > 0 && (
        <div className="ml-6 font-mono text-[10px] text-[#484F58]">
          {tokenCount} tokens
        </div>
      )}
    </motion.div>
  );
}

export function AgentStatusPanel() {
  const agents = useAgentStore((s) => s.agents);
  const activeCount = Object.values(agents).filter(
    (a) => a.status === "active" || a.status === "thinking"
  ).length;

  const allKeys: AgentKey[] = [...PARALLEL_AGENTS, "synthesis"];

  return (
    <div className="h-full rounded-lg border border-[#21262D] bg-[#0D1117]">
      <div className="flex items-center justify-between border-b border-[#21262D] px-4 py-2.5">
        <span className="font-mono text-[11px] font-semibold text-[#8B949E] tracking-wider">
          ACTIVE AGENTS
        </span>
        {activeCount > 0 && (
          <span className="font-mono text-[11px] text-[#00FF88]">
            [{activeCount}]
          </span>
        )}
      </div>
      <div className="px-4">
        {allKeys.map((key) => (
          <AgentRow key={key} agent={key} />
        ))}
      </div>
    </div>
  );
}
