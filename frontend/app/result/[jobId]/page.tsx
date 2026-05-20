"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Expand, X } from "lucide-react";
import { ValidationScore } from "@/components/report/ValidationScore";
import { Markdown } from "@/components/Markdown";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getResult, type ResultData } from "@/lib/api";

type Props = { params: Promise<{ jobId: string }> };

const SECTION_LABELS: Record<
  keyof Pick<ResultData, "market" | "competitors" | "risks" | "monetisation">,
  string
> = {
  market: "Market Opportunity",
  competitors: "Competitive Landscape",
  risks: "Risk Factors",
  monetisation: "Revenue Strategy",
};

const SECTION_COLORS: Record<string, string> = {
  market: "#9B6E2E",
  competitors: "#4A5E72",
  risks: "#B84D26",
  monetisation: "#2E6B5A",
};

function ExpandedModal({
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#251A0E]/40 backdrop-blur-sm p-4 md:p-10"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="relative flex flex-col w-full max-w-3xl max-h-[85vh] rounded-2xl border border-[#CDBFA3] bg-[#FBF8F3] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DFC9] flex-none">
          <div className="flex items-center gap-2.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span
              className="font-sans text-sm font-semibold"
              style={{ color }}
            >
              {label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#967860] hover:text-[#5A4230] transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 text-sm text-[#5A4230]">
          <Markdown>{content}</Markdown>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ReportSection({
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
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
      >
        <Card className="border-[#CDBFA3] bg-[#F3EDE0] h-full">
          <CardHeader className="pb-0 pt-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span
                  className="font-sans text-[11px] font-semibold"
                  style={{ color }}
                >
                  {label}
                </span>
              </div>
              <button
                onClick={() => setExpanded(true)}
                className="text-[#CDBFA3] hover:text-[#967860] transition-colors"
                aria-label="Read in full"
              >
                <Expand size={13} />
              </button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-2">
            <div className="max-h-28 overflow-y-auto text-xs text-[#5A4230]">
              <Markdown>{content}</Markdown>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <ExpandedModal
            label={label}
            content={content}
            color={color}
            onClose={() => setExpanded(false)}
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
  const [synthesisExpanded, setSynthesisExpanded] = useState(false);

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
          setError("Results aren't ready yet — agents may still be running.");
          setLoading(false);
        }
      }
    };

    fetchResult();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF8F3]">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#9B6E2E] border-t-transparent mx-auto" />
          <p className="text-[#967860] text-sm font-sans">Fetching results…</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF8F3]">
        <div className="text-center">
          <p className="text-[#B84D26] text-sm mb-4 font-sans">{error}</p>
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

  const sections: Array<{
    key: keyof Pick<
      ResultData,
      "market" | "competitors" | "risks" | "monetisation"
    >;
    delay: number;
  }> = [
    { key: "market", delay: 0.3 },
    { key: "competitors", delay: 0.38 },
    { key: "risks", delay: 0.46 },
    { key: "monetisation", delay: 0.54 },
  ];

  return (
    <div className="bg-[#FBF8F3] min-h-screen flex flex-col px-4 pt-6 pb-8 md:px-8 lg:px-16">
      <div className="mx-auto w-full max-w-4xl flex flex-col flex-1 min-h-0 gap-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => router.push("/")}
            className="font-sans text-xs text-[#967860] hover:text-[#5A4230] transition-colors"
          >
            ← Back
          </button>
          <span className="text-[#CDBFA3]">·</span>
          <span className="font-sans text-xs text-[#967860]">
            Analysis · {jobId.slice(0, 8)}
          </span>
        </motion.div>

        {/* Score */}
        <ValidationScore score={result.score} verdict={result.verdict} />

        {/* Four sections 2×2 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sections.map(({ key, delay }) => (
            <ReportSection
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
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62 }}
              className="rounded-xl border border-[#9B6E2E]/25 bg-[#F3EDE0] p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-[#9B6E2E]" />
                  <span className="font-sans text-xs font-semibold text-[#9B6E2E]">
                    Executive Summary
                  </span>
                </div>
                <button
                  onClick={() => setSynthesisExpanded(true)}
                  className="text-[#CDBFA3] hover:text-[#9B6E2E] transition-colors"
                  aria-label="Read synthesis in full"
                >
                  <Expand size={13} />
                </button>
              </div>
              <div className="max-h-52 overflow-y-auto text-sm text-[#251A0E]">
                <Markdown>{result.synthesis}</Markdown>
              </div>
            </motion.div>

            <AnimatePresence>
              {synthesisExpanded && (
                <ExpandedModal
                  label="Executive Summary"
                  content={result.synthesis}
                  color="#9B6E2E"
                  onClose={() => setSynthesisExpanded(false)}
                />
              )}
            </AnimatePresence>
          </>
        )}

        {/* Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="flex justify-center pt-2"
        >
          <button
            onClick={() => router.push("/")}
            className="h-10 rounded-xl border border-[#CDBFA3] px-6 font-sans text-sm text-[#9B6E2E] hover:bg-[#9B6E2E]/5 transition-colors"
          >
            Evaluate another idea →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
