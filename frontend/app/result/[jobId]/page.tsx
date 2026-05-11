"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ScoreCard } from "@/components/ScoreCard";
import { Markdown } from "@/components/Markdown";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getResult, type ResultData } from "@/lib/api";

type Props = { params: Promise<{ jobId: string }> };

const SECTION_LABELS: Record<keyof Pick<ResultData, "market" | "competitors" | "risks" | "monetisation">, string> = {
  market: "MARKET OPPORTUNITY",
  competitors: "COMPETITOR ANALYSIS",
  risks: "KEY RISKS",
  monetisation: "MONETISATION STRATEGY",
};

const SECTION_COLORS: Record<string, string> = {
  market: "#00FF88",
  competitors: "#388BFD",
  risks: "#F0883E",
  monetisation: "#8B949E",
};

function ResultSection({
  label,
  content,
  color,
  delay,
}: {
  label: string;
  content: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-[#21262D] bg-[#0D1117] h-full">
        <CardHeader className="pb-2 pt-4 px-5">
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span
              className="font-mono text-[10px] font-bold tracking-widest"
              style={{ color }}
            >
              {label}
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="text-sm text-[#8B949E]">
            <Markdown>{content}</Markdown>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ResultPage({ params }: Props) {
  const { jobId } = use(params);
  const router = useRouter();
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let retries = 0;
    const MAX = 10;

    const fetchResult = async () => {
      try {
        const data = await getResult(jobId);
        setResult(data);
        setLoading(false);
      } catch {
        retries++;
        if (retries < MAX) {
          setTimeout(fetchResult, 1500);
        } else {
          setError("Result not available. The analysis may still be running.");
          setLoading(false);
        }
      }
    };

    fetchResult();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080B0F]">
        <div className="text-center font-mono">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#00FF88] border-t-transparent mx-auto" />
          <p className="text-[#484F58] text-xs">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080B0F]">
        <div className="text-center font-mono">
          <p className="text-[#F85149] text-sm mb-4">{error}</p>
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

  const sections: Array<{
    key: keyof Pick<ResultData, "market" | "competitors" | "risks" | "monetisation">;
    delay: number;
  }> = [
    { key: "market", delay: 0.3 },
    { key: "competitors", delay: 0.4 },
    { key: "risks", delay: 0.5 },
    { key: "monetisation", delay: 0.6 },
  ];

  return (
    <div className="min-h-screen bg-[#080B0F] px-4 py-8 md:px-8 lg:px-16">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-3"
        >
          <button
            onClick={() => router.push("/")}
            className="font-mono text-xs text-[#484F58] hover:text-[#8B949E] transition-colors"
          >
            ← HOME
          </button>
          <span className="text-[#21262D]">|</span>
          <span className="font-mono text-xs text-[#484F58]">
            VALIDATION REPORT · {jobId.slice(0, 8)}
          </span>
        </motion.div>

        {/* Score card */}
        <div className="mb-6">
          <ScoreCard score={result.score} verdict={result.verdict} />
        </div>

        {/* Four sections 2x2 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
          {sections.map(({ key, delay }) => (
            <ResultSection
              key={key}
              label={SECTION_LABELS[key]}
              content={result[key]}
              color={SECTION_COLORS[key]}
              delay={delay}
            />
          ))}
        </div>

        {/* Synthesis */}
        {result.synthesis && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8 rounded-lg border border-[#00FF88]/20 bg-[#0D1117] p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FF88]" />
              <span className="font-mono text-[10px] font-bold text-[#00FF88] tracking-widest">
                SYNTHESIS — EXECUTIVE SUMMARY
              </span>
            </div>
            <div className="text-sm text-[#E6EDF3]">
              <Markdown>{result.synthesis}</Markdown>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-4 justify-center"
        >
          <button
            onClick={() => router.push("/")}
            className="h-10 rounded-lg border border-[#00FF88]/30 px-6 font-mono text-xs text-[#00FF88] hover:bg-[#00FF88]/5 transition-colors"
          >
            VALIDATE ANOTHER IDEA →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
