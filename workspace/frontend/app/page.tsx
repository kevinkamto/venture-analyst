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
      setError("Failed to start analysis. Is the backend running?");
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#080B0F] px-4">
      {/* Animated grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#00FF88 1px, transparent 1px), linear-gradient(90deg, #00FF88 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-[#00FF88]/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex justify-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#00FF88]/20 bg-[#00FF88]/5 px-4 py-1.5 text-xs font-mono text-[#00FF88]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00FF88] animate-pulse" />
            5 AI AGENTS · PARALLEL ANALYSIS
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 text-center font-mono text-4xl font-bold leading-tight tracking-tight text-[#E6EDF3] md:text-5xl lg:text-6xl"
        >
          IS YOUR IDEA
          <br />
          <span className="text-[#00FF88]">WORTH BUILDING?</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10 text-center font-sans text-[#8B949E] text-lg"
        >
          5 AI agents. Parallel analysis. Real answers.
        </motion.p>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <Textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your startup idea... e.g. 'An AI-powered tool that helps solo founders validate business ideas before building'"
            className="min-h-[140px] resize-none rounded-lg border-[#21262D] bg-[#0D1117] font-sans text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00FF88]/50 text-base"
            disabled={loading}
          />

          {error && (
            <p className="text-sm text-[#F85149] font-mono">{error}</p>
          )}

          <motion.button
            type="submit"
            disabled={loading || !idea.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group h-14 w-full rounded-lg bg-[#00FF88] font-mono text-sm font-bold text-[#080B0F] transition-all disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#080B0F] border-t-transparent" />
                INITIALIZING AGENTS...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                RUN ANALYSIS
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            )}
          </motion.button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center font-mono text-xs text-[#484F58]"
        >
          Market · Competitors · Risks · Monetisation · Synthesis
        </motion.p>
      </motion.div>
    </main>
  );
}
