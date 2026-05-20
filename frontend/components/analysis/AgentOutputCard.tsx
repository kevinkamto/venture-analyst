"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Expand, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/Markdown";
import {
  type AgentKey,
  type AgentStatus,
  AGENT_LABELS,
  useAgentStore,
} from "@/store/agentStore";

const STATUS_BADGE: Record<AgentStatus, string> = {
  idle: "text-[#967860] border-[#CDBFA3] bg-transparent",
  thinking: "text-[#4A5E72] border-[#4A5E72]/40 bg-[#4A5E72]/5",
  active: "text-[#9B6E2E] border-[#9B6E2E]/40 bg-[#9B6E2E]/5",
  complete: "text-[#2E6B5A] border-[#2E6B5A]/40 bg-[#2E6B5A]/5",
  error: "text-[#B84D26] border-[#B84D26]/40 bg-[#B84D26]/5",
};

const STATUS_LABELS: Record<AgentStatus, string> = {
  idle: "Waiting",
  thinking: "Thinking",
  active: "Streaming",
  complete: "Done",
  error: "Failed",
};

const STATUS_DOT: Record<AgentStatus, string> = {
  idle: "bg-[#CDBFA3]",
  thinking: "bg-[#4A5E72] animate-pulse",
  active: "bg-[#9B6E2E] animate-pulse",
  complete: "bg-[#2E6B5A]",
  error: "bg-[#B84D26]",
};

const AGENT_ACCENT: Record<AgentKey, string> = {
  market_research: "#9B6E2E",
  competitor: "#4A5E72",
  risk: "#B84D26",
  monetisation: "#2E6B5A",
  synthesis: "#9B6E2E",
};

function ExpandedModal({
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
  const color = AGENT_ACCENT[agent];
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#251A0E]/40 backdrop-blur-sm p-4 md:p-10"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="relative flex flex-col w-full max-w-3xl max-h-[85vh] rounded-2xl border border-[#CDBFA3] bg-[#FBF8F3] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DFC9] flex-none">
          <div className="flex items-center gap-2.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span
              className="font-sans text-sm font-semibold"
              style={{ color }}
            >
              {AGENT_LABELS[agent]}
            </span>
            <Badge
              variant="outline"
              className={`font-sans text-[11px] px-2 py-0 ${STATUS_BADGE[status]}`}
            >
              {STATUS_LABELS[status]}
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="text-[#967860] hover:text-[#5A4230] transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-2">
          {toolCalls.map((tc, i) => (
            <div
              key={i}
              className="font-mono text-[11px] text-[#4A5E72] opacity-80"
            >
              &gt; {tc}
            </div>
          ))}
          {output && (
            <div className="text-sm text-[#5A4230]">
              <Markdown>{output}</Markdown>
              {isActive && (
                <span className="mt-1 inline-block h-3 w-0.5 animate-pulse bg-[#9B6E2E]" />
              )}
            </div>
          )}
          {status === "thinking" && !output && (
            <div className="font-sans text-xs text-[#4A5E72]">
              <span className="animate-pulse">Gathering context…</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

type Props = { agent: AgentKey; fill?: boolean };

export function AgentOutputCard({ agent, fill }: Props) {
  const state = useAgentStore((s) => s.agents[agent]);
  const { status, output, toolCalls, tokenCount, startedAt } = state;
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  const elapsed = startedAt
    ? Math.floor((Date.now() - startedAt) / 1000)
    : null;

  const cardBorder =
    status === "active"
      ? "border-[#9B6E2E]/40 shadow-[0_2px_16px_#9B6E2E18]"
      : status === "thinking"
        ? "border-[#4A5E72]/30 shadow-[0_2px_12px_#4A5E7212]"
        : status === "complete"
          ? "border-[#2E6B5A]/30"
          : status === "error"
            ? "border-[#B84D26]/30"
            : "border-[#CDBFA3]";

  const isActive = status === "active" || status === "thinking";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={fill ? "h-full" : undefined}
    >
      <Card
        className={`border bg-[#F3EDE0] transition-all duration-300 ${fill ? "h-full" : "max-h-52"} overflow-hidden flex flex-col ${cardBorder} pt-2 pb-1 gap-1`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-1 pt-0 px-4">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
            <span className="font-sans text-xs font-semibold text-[#251A0E]">
              {AGENT_LABELS[agent]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {elapsed !== null && (
              <span className="font-mono text-[10px] text-[#967860]">
                {elapsed}s
              </span>
            )}
            {tokenCount > 0 && (
              <span className="font-mono text-[10px] text-[#967860]">
                {tokenCount} t
              </span>
            )}
            <Badge
              variant="outline"
              className={`font-sans text-[10px] px-1.5 py-0 ${STATUS_BADGE[status]}`}
            >
              {STATUS_LABELS[status]}
            </Badge>
            <button
              onClick={() => setExpanded(true)}
              className="text-[#CDBFA3] hover:text-[#967860] transition-colors"
              aria-label="Read in full"
            >
              <Expand size={12} />
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
                {toolCalls.length > 0 && (
                  <div className="max-h-14 overflow-y-auto flex-none border-b border-[#E8DFC9] pb-2 mb-2">
                    {toolCalls.map((tc, i) => (
                      <div
                        key={i}
                        className="mb-0.5 font-mono text-[10px] text-[#4A5E72] opacity-80"
                      >
                        &gt; {tc}
                      </div>
                    ))}
                  </div>
                )}

                {output && (
                  <div
                    ref={scrollRef}
                    className="mt-1 flex-1 min-h-0 overflow-y-auto text-xs text-[#5A4230]"
                  >
                    <Markdown>{output}</Markdown>
                    {isActive && (
                      <span className="mt-1 inline-block h-3 w-0.5 animate-pulse bg-[#9B6E2E]" />
                    )}
                  </div>
                )}

                {status === "thinking" && !output && (
                  <div className="flex items-center gap-1.5 font-sans text-xs text-[#4A5E72]">
                    <span className="animate-pulse">Gathering context…</span>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <AnimatePresence>
        {expanded && (
          <ExpandedModal
            agent={agent}
            status={status}
            output={output}
            toolCalls={toolCalls}
            onClose={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
