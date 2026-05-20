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
      className="rounded-xl border border-[#CDBFA3] bg-[#F3EDE0] p-6"
    >
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="font-sans text-[11px] text-[#967860] tracking-widest uppercase mb-1">
            Validation Score
          </p>
          <div className="flex items-baseline gap-1">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-display text-5xl font-bold"
              style={{ color }}
            >
              {score}
            </motion.span>
            <span className="font-sans text-xl text-[#CDBFA3]">/ 100</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-sans text-[11px] text-[#967860] tracking-widest uppercase mb-1">
            Verdict
          </p>
          <span
            className="inline-block font-sans text-sm font-semibold px-3 py-1 rounded-lg"
            style={{ color, backgroundColor: bg }}
          >
            {verdict}
          </span>
        </div>
      </div>

      <Progress value={score}>
        <ProgressTrack className="h-2 bg-[#E8DFC9]">
          <ProgressIndicator style={{ backgroundColor: color }} />
        </ProgressTrack>
      </Progress>
    </motion.div>
  );
}
