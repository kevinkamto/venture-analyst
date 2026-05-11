"use client";

import { motion } from "framer-motion";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";

type Props = {
  score: number;
  verdict: string;
};

const VERDICT_COLOR: Record<string, string> = {
  "STRONG OPPORTUNITY": "#00FF88",
  PROMISING: "#00FF88",
  "PROCEED WITH CAUTION": "#F0883E",
  "HIGH RISK": "#F85149",
  "NOT RECOMMENDED": "#F85149",
};

export function ScoreCard({ score, verdict }: Props) {
  const color = VERDICT_COLOR[verdict] ?? "#8B949E";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-lg border border-[#21262D] bg-[#0D1117] p-6"
    >
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="font-mono text-[11px] text-[#484F58] tracking-widest mb-1">
            VALIDATION SCORE
          </p>
          <div className="flex items-baseline gap-1">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-mono text-5xl font-bold"
              style={{ color }}
            >
              {score}
            </motion.span>
            <span className="font-mono text-xl text-[#484F58]">/ 100</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-[11px] text-[#484F58] tracking-widest mb-1">
            VERDICT
          </p>
          <span className="font-mono text-sm font-bold" style={{ color }}>
            {verdict}
          </span>
        </div>
      </div>

      <Progress value={score}>
        <ProgressTrack className="h-2 bg-[#161B22]">
          <ProgressIndicator style={{ backgroundColor: color }} />
        </ProgressTrack>
      </Progress>
    </motion.div>
  );
}
