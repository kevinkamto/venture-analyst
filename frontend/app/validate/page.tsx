"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AgentOutputCard } from "@/components/analysis/AgentOutputCard";
import { ActivityFeed } from "@/components/analysis/ActivityFeed";
import { AgentProgressList } from "@/components/analysis/AgentProgressList";
import { useAgentStream } from "@/hooks/useAgentStream";
import { useAgentStore, PARALLEL_AGENTS } from "@/store/agentStore";

function AnalysisDashboard() {
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
      <div className="flex min-h-screen items-center justify-center bg-[#FBF8F3]">
        <div className="text-center">
          <p className="text-[#B84D26] text-sm mb-4 font-sans">No active job — nothing to show here.</p>
          <button
            onClick={() => router.push("/")}
            className="text-[#9B6E2E] text-sm underline font-sans"
          >
            Submit a new idea →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#FBF8F3] flex flex-col px-4 pt-5 md:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-none mb-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="font-sans text-xs text-[#967860] hover:text-[#5A4230] transition-colors"
          >
            ← Back
          </button>
          <span className="text-[#CDBFA3]">·</span>
          <h1 className="font-sans text-sm font-semibold text-[#251A0E]">
            Agents working
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {isRunning && (
            <span className="flex items-center gap-1.5 font-sans text-xs text-[#9B6E2E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#9B6E2E] animate-pulse" />
              Live
            </span>
          )}
          {!isRunning && synthStatus === "complete" && (
            <span className="flex items-center gap-1.5 font-sans text-xs text-[#2E6B5A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2E6B5A]" />
              Compiling findings…
            </span>
          )}
          <span className="font-mono text-[10px] text-[#CDBFA3]">
            {activeJobId.slice(0, 8)}
          </span>
        </div>
      </motion.div>

      {/* Two-column layout: left 65% output, right 35% activity + status */}
      <div className="flex-1 min-h-0 grid grid-cols-1 gap-4 pb-4 lg:grid-cols-[1fr_280px]">

        {/* Left — agent output cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="min-h-0 overflow-y-auto flex flex-col gap-3"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {PARALLEL_AGENTS.map((agent, i) => (
              <motion.div
                key={agent}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
              >
                <AgentOutputCard agent={agent} />
              </motion.div>
            ))}
          </div>

          <div className="flex-1 min-h-0">
            <AgentOutputCard agent="synthesis" fill />
          </div>
        </motion.div>

        {/* Right — status list + activity feed stacked */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="min-h-0 flex flex-col gap-3"
        >
          <div className="flex-none">
            <AgentProgressList />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <ActivityFeed />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ValidatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FBF8F3]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9B6E2E] border-t-transparent" />
        </div>
      }
    >
      <AnalysisDashboard />
    </Suspense>
  );
}
