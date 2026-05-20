"use client";

import { motion } from "framer-motion";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";

type Props = {
  score: number;
  verdict: string;
};

const VERDICT_COLOR: Record<string, string> = {
  "STRONG OPPORTUNITY": "#2E6B5A",
  PROMISING: "#2E6B5A",
  "PROCEED WITH CAUTION": "#9B6E2E",
  "HIGH RISK": "#B84D26",
  "NOT RECOMMENDED": "#B84D26",
};

const VERDICT_BG: Record<string, string> = {
  "STRONG OPPORTUNITY": "#2E6B5A10",
  PROMISING: "#2E6B5A10",
  "PROCEED WITH CAUTION": "#9B6E2E10",
  "HIGH RISK": "#B84D2610",
  "NOT RECOMMENDED": "#B84D2610",
};

export function ValidationScore({ score, verdict }: Props) {
  const color = VERDICT_COLOR[verdict] ?? "#967860";
  const bg = VERDICT_BG[verdict] ?? "transparent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="py-10 text-center"
    >
      <div className="flex items-baseline justify-center gap-2 mb-4">
        <motion.span
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
          className="font-display text-8xl font-bold leading-none"
          style={{ color }}
        >
          {score}
        </motion.span>
        <span className="font-sans text-2xl text-[#CDBFA3] leading-none">/ 100</span>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mb-8"
      >
        <span
          className="inline-block font-sans text-sm font-semibold tracking-wide px-4 py-1.5 rounded-lg"
          style={{ color, backgroundColor: bg }}
        >
          {verdict}
        </span>
      </motion.div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.45, duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-xs origin-left"
      >
        <Progress value={score}>
          <ProgressTrack className="h-1 bg-[#E8DFC9]">
            <ProgressIndicator style={{ backgroundColor: color }} />
          </ProgressTrack>
        </Progress>
      </motion.div>
    </motion.div>
  );
}
