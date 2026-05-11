"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type AgentKey, type AgentStatus, AGENT_LABELS, useAgentStore } from "@/store/agentStore";

const STATUS_COLORS: Record<AgentStatus, string> = {
  idle: "text-[#484F58] border-[#21262D]",
  thinking: "text-[#388BFD] border-[#388BFD]/40",
  active: "text-[#00FF88] border-[#00FF88]/40",
  complete: "text-[#00FF88] border-[#00FF88]/40",
  error: "text-[#F85149] border-[#F85149]/40",
};

const STATUS_LABELS: Record<AgentStatus, string> = {
  idle: "IDLE",
  thinking: "THINKING",
  active: "ACTIVE",
  complete: "COMPLETE",
  error: "ERROR",
};

const STATUS_DOT: Record<AgentStatus, string> = {
  idle: "bg-[#484F58]",
  thinking: "bg-[#388BFD] animate-pulse",
  active: "bg-[#00FF88] animate-pulse",
  complete: "bg-[#00FF88]",
  error: "bg-[#F85149]",
};

type Props = { agent: AgentKey };

export function AgentCard({ agent }: Props) {
  const state = useAgentStore((s) => s.agents[agent]);
  const { status, output, toolCalls, tokenCount, startedAt } = state;

  const elapsed = startedAt
    ? Math.floor((Date.now() - startedAt) / 1000)
    : null;

  const glowClass =
    status === "active"
      ? "border-[#00FF88]/30 shadow-[0_0_20px_#00FF8820]"
      : status === "thinking"
      ? "border-[#388BFD]/30 shadow-[0_0_16px_#388BFD15]"
      : status === "error"
      ? "border-[#F85149]/30"
      : "border-[#21262D]";

  const isActive = status === "active" || status === "thinking";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`border bg-[#0D1117] transition-all duration-300 ${glowClass}`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-4">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
            <span className="font-mono text-xs font-semibold text-[#E6EDF3]">
              {AGENT_LABELS[agent]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {elapsed !== null && (
              <span className="font-mono text-xs text-[#484F58]">
                {elapsed}s
              </span>
            )}
            {tokenCount > 0 && (
              <span className="font-mono text-xs text-[#484F58]">
                {tokenCount} tok
              </span>
            )}
            <Badge
              variant="outline"
              className={`font-mono text-[10px] px-1.5 py-0 ${STATUS_COLORS[status]}`}
            >
              {STATUS_LABELS[status]}
            </Badge>
          </div>
        </CardHeader>

        <AnimatePresence>
          {(status !== "idle" || toolCalls.length > 0) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="px-4 pb-3">
                {/* Tool calls */}
                {toolCalls.map((tc, i) => (
                  <div
                    key={i}
                    className="mb-1 font-mono text-[11px] text-[#388BFD] opacity-80"
                  >
                    &gt; {tc}
                  </div>
                ))}

                {/* Streaming output */}
                {output && (
                  <div className="mt-1 max-h-48 overflow-y-auto font-sans text-xs leading-relaxed text-[#8B949E] whitespace-pre-wrap">
                    {output}
                    {isActive && (
                      <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-[#00FF88]" />
                    )}
                  </div>
                )}

                {status === "thinking" && !output && (
                  <div className="flex items-center gap-1.5 font-mono text-xs text-[#388BFD]">
                    <span className="animate-pulse">···</span>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
