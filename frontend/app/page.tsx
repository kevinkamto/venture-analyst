"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { startValidation } from "@/lib/api";
import { useAgentStore } from "@/store/agentStore";

export default function LandingPage() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const reset = useAgentStore((s) => s.reset);
  const setJobId = useAgentStore((s) => s.setJobId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    setLoading(true);
    setError("");
    reset();
    try {
      const { job_id } = await startValidation(idea.trim());
      setJobId(job_id);
      router.push(`/validate?job=${job_id}`);
    } catch {
      setError("Could not reach the analysis server. Please check that the backend is running.");
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#FBF8F3] px-4">
      {/* Subtle warm paper texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #9B6E2E 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Soft warm glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-150 w-150 rounded-full bg-[#9B6E2E]/6 blur-[140px]" />
      </div>

      {/* Brand wordmark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="absolute top-6 left-6 z-10 flex items-center gap-1.5"
      >
        <span className="inline-block h-2 w-2 rotate-45 bg-[#9B6E2E]" />
        <span className="font-display text-sm italic font-semibold text-[#251A0E] leading-none">Venture</span>
        <span className="font-sans text-sm font-medium text-[#5A4230] leading-none">Analyst</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl"
      >
        {/* Label chip */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-7 flex justify-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#CDBFA3] bg-[#F3EDE0] px-4 py-1.5 text-xs font-sans font-medium text-[#9B6E2E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9B6E2E] animate-pulse" />
            Five specialist agents
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mb-4 text-center font-display text-4xl font-bold leading-tight tracking-tight text-[#251A0E] md:text-5xl"
        >
          Not every idea{" "}
          <span className="italic text-[#9B6E2E]">is worth building.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="mb-9 text-center font-sans text-[#5A4230] text-base leading-relaxed"
        >
          Describe the concept. Five analysts — market, competition, risk,
          monetisation, synthesis — will scrutinise it in parallel and
          return a scored verdict.
        </motion.p>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-3"
        >
          <Textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g. A platform that matches independent coffee shops with local roasters, handling discovery, orders, and contracts…"
            className="min-h-32.5 resize-none rounded-xl border-[#CDBFA3] bg-[#F3EDE0] font-sans text-[#251A0E] placeholder:text-[#967860] focus:border-[#9B6E2E]/60 text-sm leading-relaxed shadow-sm"
            disabled={loading}
          />

          {error && (
            <p className="text-sm text-[#B84D26] font-sans">{error}</p>
          )}

          <motion.button
            type="submit"
            disabled={loading || !idea.trim()}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="group h-12 w-full rounded-xl bg-[#9B6E2E] font-sans text-sm font-semibold text-[#FBF8F3] transition-all hover:bg-[#7D5720] disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FBF8F3] border-t-transparent" />
                Spinning up agents…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Run the analysis
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            )}
          </motion.button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-7 text-center font-sans text-xs text-[#967860]"
        >
          Market · Competition · Risk · Revenue · Synthesis
        </motion.p>
      </motion.div>
    </main>
  );
}
