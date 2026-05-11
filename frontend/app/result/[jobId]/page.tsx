"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X } from "lucide-react";
import { ScoreCard } from "@/components/ScoreCard";
import { Markdown } from "@/components/Markdown";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getResult, type ResultData } from "@/lib/api";

type Props = { params: Promise<{ jobId: string }> };

const SECTION_LABELS: Record<
  keyof Pick<ResultData, "market" | "competitors" | "risks" | "monetisation">,
  string
> = {
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

function FullscreenModal({
  label,
  content,
  color,
  onClose,
}: {
  label: string;
  content: string;
  color: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="relative flex flex-col w-full max-w-4xl max-h-[85vh] rounded-xl border border-[#21262D] bg-[#0D1117] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#21262D] flex-none">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-mono text-xs font-bold tracking-widest" style={{ color }}>
              {label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#484F58] hover:text-[#8B949E] transition-colors"
            aria-label="Close fullscreen"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 text-sm text-[#8B949E]">
          <Markdown>{content}</Markdown>
        </div>
      </motion.div>
    </motion.div>
  );
}

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
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
      >
        <Card className="border-[#21262D] bg-[#0D1117] h-full">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
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
              <button
                onClick={() => setFullscreen(true)}
                className="text-[#484F58] hover:text-[#8B949E] transition-colors"
                aria-label="Expand to fullscreen"
              >
                <Maximize2 size={13} />
              </button>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="max-h-36 overflow-y-auto text-sm text-[#8B949E]">
              <Markdown>{content}</Markdown>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {fullscreen && (
          <FullscreenModal
            label={label}
            content={content}
            color={color}
            onClose={() => setFullscreen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function ResultPage({ params }: Props) {
  const { jobId } = use(params);
  const router = useRouter();
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [synthesisFullscreen, setSynthesisFullscreen] = useState(false);

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
    key: keyof Pick<
      ResultData,
      "market" | "competitors" | "risks" | "monetisation"
    >;
    delay: number;
  }> = [
    { key: "market", delay: 0.3 },
    { key: "competitors", delay: 0.4 },
    { key: "risks", delay: 0.5 },
    { key: "monetisation", delay: 0.6 },
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#080B0F] flex flex-col px-4 pt-6 pb-4 md:px-8 lg:px-16">
      <div className="mx-auto w-full max-w-5xl flex flex-col flex-1 min-h-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-none mb-4 flex items-center gap-3"
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
        <div className="flex-none mb-4">
          <ScoreCard score={result.score} verdict={result.verdict} />
        </div>

        {/* Four sections 2x2 + Synthesis — fills remaining height */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pb-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-1">
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
            <>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="rounded-lg border border-[#00FF88]/20 bg-[#0D1117] p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00FF88]" />
                    <span className="font-mono text-[10px] font-bold text-[#00FF88] tracking-widest">
                      SYNTHESIS — EXECUTIVE SUMMARY
                    </span>
                  </div>
                  <button
                    onClick={() => setSynthesisFullscreen(true)}
                    className="text-[#484F58] hover:text-[#00FF88] transition-colors"
                    aria-label="Expand to fullscreen"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto text-sm text-[#E6EDF3]">
                  <Markdown>{result.synthesis}</Markdown>
                </div>
              </motion.div>

              <AnimatePresence>
                {synthesisFullscreen && (
                  <FullscreenModal
                    label="SYNTHESIS — EXECUTIVE SUMMARY"
                    content={result.synthesis}
                    color="#00FF88"
                    onClose={() => setSynthesisFullscreen(false)}
                  />
                )}
              </AnimatePresence>
            </>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex gap-4 justify-center pt-2"
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
    </div>
  );
}
