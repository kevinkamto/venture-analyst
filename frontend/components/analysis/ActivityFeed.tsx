"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAgentStore } from "@/store/agentStore";

const AGENT_COLORS: Record<string, string> = {
  market_research: "#9B6E2E",
  competitor: "#4A5E72",
  risk: "#B84D26",
  monetisation: "#2E6B5A",
  synthesis: "#251A0E",
  system: "#CDBFA3",
};

const AGENT_SHORT: Record<string, string> = {
  market_research: "market",
  competitor: "comp  ",
  risk: "risk  ",
  monetisation: "monet ",
  synthesis: "synth ",
  system: "system",
};

export function ActivityFeed() {
  const logs = useAgentStore((s) => s.logs);
  const isRunning = useAgentStore((s) => s.isRunning);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#CDBFA3] bg-[#F3EDE0]">
      <div className="flex items-center justify-between border-b border-[#E8DFC9] px-4 py-2.5">
        <span className="font-sans text-[11px] font-semibold text-[#967860] tracking-wide uppercase">
          Activity
        </span>
        {isRunning && (
          <span className="flex items-center gap-1.5 font-sans text-[10px] text-[#9B6E2E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9B6E2E] animate-pulse" />
            live
          </span>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-0.5">
          <AnimatePresence initial={false}>
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.12 }}
                className="flex gap-2 font-mono text-[10px] leading-5"
              >
                <span className="shrink-0 text-[#CDBFA3]">{log.time}</span>
                <span
                  className="shrink-0 w-[38px]"
                  style={{ color: AGENT_COLORS[log.agent] ?? "#967860" }}
                >
                  {AGENT_SHORT[log.agent] ?? log.agent}
                </span>
                <span className="shrink-0 w-14 text-[#967860]">{log.type}</span>
                {log.type === "token" ? null : (
                  <span className="text-[#5A4230] truncate max-w-[140px]">
                    {log.message.slice(0, 80)}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
