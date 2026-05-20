"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Markdown } from "@/components/Markdown";
import { useAgentStore } from "@/store/agentStore";

export function SynthesisOutput() {
  const synthState = useAgentStore((s) => s.agents.synthesis);
  const { status, output } = synthState;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  if (status === "idle") return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mt-4 rounded-xl border border-[#9B6E2E]/30 bg-[#F3EDE0] shadow-[0_2px_20px_#9B6E2E10]"
    >
      <div className="flex items-center gap-3 px-5 py-3">
        <span className="h-2 w-2 rounded-full bg-[#9B6E2E] animate-pulse" />
        <span className="font-sans text-xs font-semibold text-[#9B6E2E]">
          Synthesis — Final Analysis
        </span>
        {status === "complete" && (
          <span className="ml-auto font-mono text-[10px] text-[#967860]">
            complete
          </span>
        )}
      </div>
      <Separator className="bg-[#9B6E2E]/15" />
      <div className="px-5 py-4">
        <div ref={scrollRef} className="max-h-52 overflow-y-auto text-sm text-[#251A0E]">
          <Markdown>{output}</Markdown>
          {(status === "active" || status === "thinking") && (
            <span className="mt-1 inline-block h-3.5 w-0.5 animate-pulse bg-[#9B6E2E]" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
