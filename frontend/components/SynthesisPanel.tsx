"use client";

import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Markdown } from "@/components/Markdown";
import { useAgentStore } from "@/store/agentStore";

export function SynthesisPanel() {
  const synthState = useAgentStore((s) => s.agents.synthesis);
  const { status, output } = synthState;

  if (status === "idle") return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mt-4 rounded-lg border border-[#00FF88]/30 bg-[#0D1117] shadow-[0_0_40px_#00FF8815]"
    >
      <div className="flex items-center gap-3 px-5 py-3">
        <span className="h-2 w-2 rounded-full bg-[#00FF88] animate-pulse" />
        <span className="font-mono text-xs font-bold text-[#00FF88] tracking-widest">
          SYNTHESIS AGENT — FINAL ANALYSIS
        </span>
        {status === "complete" && (
          <span className="ml-auto font-mono text-[10px] text-[#484F58]">
            COMPLETE
          </span>
        )}
      </div>
      <Separator className="bg-[#00FF88]/10" />
      <div className="px-5 py-4">
        <div className="text-sm text-[#E6EDF3]">
          <Markdown>{output}</Markdown>
          {(status === "active" || status === "thinking") && (
            <span className="mt-1 inline-block h-3.5 w-0.5 animate-pulse bg-[#00FF88]" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
