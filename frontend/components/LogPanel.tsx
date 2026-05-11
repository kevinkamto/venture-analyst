"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAgentStore } from "@/store/agentStore";

const AGENT_COLORS: Record<string, string> = {
  market_research: "#00FF88",
  competitor: "#388BFD",
  risk: "#F0883E",
  monetisation: "#8B949E",
  synthesis: "#E6EDF3",
  system: "#484F58",
};

const AGENT_SHORT: Record<string, string> = {
  market_research: "market",
  competitor: "comp  ",
  risk: "risk  ",
  monetisation: "monet ",
  synthesis: "synth ",
  system: "system",
};

export function LogPanel() {
  const logs = useAgentStore((s) => s.logs);
  const isRunning = useAgentStore((s) => s.isRunning);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div className="flex h-full flex-col rounded-lg border border-[#21262D] bg-[#0D1117]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#21262D] px-4 py-2.5">
        <span className="font-mono text-[11px] font-semibold text-[#8B949E] tracking-wider">
          SYSTEM LOGS
        </span>
        {isRunning && (
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#F85149]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F85149] animate-pulse" />
            LIVE
          </span>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-0.5">
          <AnimatePresence initial={false}>
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="flex gap-2 font-mono text-[10px] leading-5"
              >
                <span className="shrink-0 text-[#484F58]">{log.time}</span>
                <span
                  className="shrink-0 w-[38px]"
                  style={{ color: AGENT_COLORS[log.agent] ?? "#8B949E" }}
                >
                  {AGENT_SHORT[log.agent] ?? log.agent}
                </span>
                <span className="shrink-0 w-[60px] text-[#484F58]">
                  {log.type}
                </span>
                {log.type === "token" ? null : (
                  <span className="text-[#8B949E] truncate max-w-[160px]">
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
