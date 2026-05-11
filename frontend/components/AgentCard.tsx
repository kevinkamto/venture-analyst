"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/Markdown";
import {
  type AgentKey,
  type AgentStatus,
  AGENT_LABELS,
  useAgentStore,
} from "@/store/agentStore";

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

const AGENT_COLORS: Record<AgentKey, string> = {
  market_research: "#00FF88",
  competitor: "#388BFD",
  risk: "#F0883E",
  monetisation: "#8B949E",
  synthesis: "#00FF88",
};

function AgentFullscreenModal({
  agent,
  status,
  output,
  toolCalls,
  onClose,
}: {
  agent: AgentKey;
  status: AgentStatus;
  output: string;
  toolCalls: string[];
  onClose: () => void;
}) {
  const color = AGENT_COLORS[agent];
  const isActive = status === "active" || status === "thinking";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="relative flex flex-col w-full max-w-4xl max-h-[85vh] rounded-xl border border-[#21262D] bg-[#0D1117] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#21262D] flex-none">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span
              className="font-mono text-xs font-bold tracking-widest"
              style={{ color }}
            >
              {AGENT_LABELS[agent]}
            </span>
            <Badge
              variant="outline"
              className={`font-mono text-[10px] px-1.5 py-0 ${STATUS_COLORS[status]}`}
            >
              {STATUS_LABELS[status]}
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="text-[#484F58] hover:text-[#8B949E] transition-colors"
            aria-label="Close fullscreen"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-2">
          {toolCalls.map((tc, i) => (
            <div
              key={i}
              className="font-mono text-[11px] text-[#388BFD] opacity-80"
            >
              &gt; {tc}
            </div>
          ))}
          {output && (
            <div className="text-sm text-[#8B949E]">
              <Markdown>{output}</Markdown>
              {isActive && (
                <span className="mt-1 inline-block h-3 w-0.5 animate-pulse bg-[#00FF88]" />
              )}
            </div>
          )}
          {status === "thinking" && !output && (
            <div className="font-mono text-xs text-[#388BFD]">
              <span className="animate-pulse">···</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

type Props = { agent: AgentKey; fill?: boolean };

export function AgentCard({ agent, fill }: Props) {
  const state = useAgentStore((s) => s.agents[agent]);
  const { status, output, toolCalls, tokenCount, startedAt } = state;
  const [fullscreen, setFullscreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

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
      className={fill ? "h-full" : undefined}
    >
      <Card
        className={`border bg-[#0D1117] transition-all duration-300 ${fill ? "h-full" : "max-h-48"} overflow-hidden flex flex-col ${glowClass} pt-2 pb-1`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-0 pt-0 px-3">
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
            <button
              onClick={() => setFullscreen(true)}
              className="text-[#484F58] hover:text-[#8B949E] transition-colors"
              aria-label="Expand to fullscreen"
            >
              <Maximize2 size={12} />
            </button>
          </div>
        </CardHeader>

        <AnimatePresence>
          {(status !== "idle" || toolCalls.length > 0) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-h-0 flex flex-col"
            >
              <CardContent className="px-4 pb-3 flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* Tool calls */}
                {toolCalls.length > 0 && (
                  <div className="max-h-16 overflow-y-auto flex-none border-b border-[#21262D] pb-2 mb-2">
                    {toolCalls.map((tc, i) => (
                      <div
                        key={i}
                        className="mb-1 font-mono text-[11px] text-[#388BFD] opacity-80"
                      >
                        &gt; {tc}
                      </div>
                    ))}
                  </div>
                )}

                {/* Streaming output */}
                {output && (
                  <div
                    ref={scrollRef}
                    className="mt-1 flex-1 min-h-0 overflow-y-auto text-xs text-[#8B949E]"
                  >
                    <Markdown>{output}</Markdown>
                    {isActive && (
                      <span className="mt-1 inline-block h-3 w-0.5 animate-pulse bg-[#00FF88]" />
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

      <AnimatePresence>
        {fullscreen && (
          <AgentFullscreenModal
            agent={agent}
            status={status}
            output={output}
            toolCalls={toolCalls}
            onClose={() => setFullscreen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
