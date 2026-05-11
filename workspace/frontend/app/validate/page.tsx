"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AgentCard } from "@/components/AgentCard";
import { LogPanel } from "@/components/LogPanel";
import { AgentStatusPanel } from "@/components/AgentStatusPanel";
import { SynthesisPanel } from "@/components/SynthesisPanel";
import { useAgentStream } from "@/hooks/useAgentStream";
import { useAgentStore, PARALLEL_AGENTS } from "@/store/agentStore";

function ValidateDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("job");

  const storeJobId = useAgentStore((s) => s.jobId);
  const isRunning = useAgentStore((s) => s.isRunning);
  const synthStatus = useAgentStore((s) => s.agents.synthesis.status);

  const activeJobId = jobId ?? storeJobId;

  useAgentStream(activeJobId);

  useEffect(() => {
    if (synthStatus === "complete" && !isRunning && activeJobId) {
      const timer = setTimeout(() => {
        router.push(`/result/${activeJobId}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [synthStatus, isRunning, activeJobId, router]);

  if (!activeJobId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080B0F]">
        <div className="text-center font-mono">
          <p className="text-[#F85149] text-sm mb-4">No job ID found.</p>
          <button
            onClick={() => router.push("/")}
            className="text-[#00FF88] text-xs underline"
          >
            Start a new analysis →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B0F] px-4 py-6 md:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="font-mono text-xs text-[#484F58] hover:text-[#8B949E] transition-colors"
          >
            ← HOME
          </button>
          <span className="text-[#21262D]">|</span>
          <h1 className="font-mono text-sm font-bold text-[#E6EDF3]">
            ANALYSIS IN PROGRESS
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="flex items-center gap-1.5 font-mono text-xs text-[#00FF88]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FF88] animate-pulse" />
              RUNNING
            </span>
          )}
          {!isRunning && synthStatus === "complete" && (
            <span className="flex items-center gap-1.5 font-mono text-xs text-[#00FF88]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FF88]" />
              REDIRECTING TO REPORT...
            </span>
          )}
          <span className="font-mono text-[10px] text-[#484F58]">
            {activeJobId.slice(0, 8)}
          </span>
        </div>
      </motion.div>

      {/* Three-column layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr_240px]">
        {/* Left — Agent status */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:sticky lg:top-6 lg:self-start"
        >
          <AgentStatusPanel />
        </motion.div>

        {/* Center — Live output cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-3"
        >
          {PARALLEL_AGENTS.map((agent, i) => (
            <motion.div
              key={agent}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
            >
              <AgentCard agent={agent} />
            </motion.div>
          ))}

          <SynthesisPanel />
        </motion.div>

        {/* Right — Log feed */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="h-150 lg:sticky lg:top-6 lg:self-start"
        >
          <LogPanel />
        </motion.div>
      </div>
    </div>
  );
}

export default function ValidatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#080B0F]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00FF88] border-t-transparent" />
        </div>
      }
    >
      <ValidateDashboard />
    </Suspense>
  );
}
