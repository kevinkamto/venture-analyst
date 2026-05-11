const API_BASE = "http://localhost:8000/api";

export type ResultData = {
  job_id: string;
  score: number;
  verdict: string;
  market: string;
  competitors: string;
  risks: string;
  monetisation: string;
  synthesis: string;
};

export const startValidation = async (
  idea: string
): Promise<{ job_id: string }> => {
  const res = await fetch(`${API_BASE}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea }),
  });
  if (!res.ok) throw new Error(`Validation failed: ${res.status}`);
  return res.json();
};

export const getResult = async (jobId: string): Promise<ResultData> => {
  const res = await fetch(`${API_BASE}/result/${jobId}`);
  if (!res.ok) throw new Error(`Result not ready: ${res.status}`);
  return res.json();
};

export const getStreamUrl = (jobId: string) =>
  `${API_BASE}/stream/${jobId}`;
