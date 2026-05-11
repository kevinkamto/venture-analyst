"use client";

import { useEffect, useRef } from "react";
import { getStreamUrl } from "@/lib/api";
import {
  useAgentStore,
  type AgentKey,
} from "@/store/agentStore";

type RawEvent = {
  agent: string;
  type: string;
  data: string;
};

const now = () =>
  new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export function useAgentStream(jobId: string | null) {
  const esRef = useRef<EventSource | null>(null);
  const { appendToken, setStatus, addToolCall, addLog, setRunning } =
    useAgentStore();

  useEffect(() => {
    if (!jobId) return;

    const connect = () => {
      const es = new EventSource(getStreamUrl(jobId));
      esRef.current = es;

      es.onmessage = (e) => {
        let event: RawEvent;
        try {
          event = JSON.parse(e.data as string) as RawEvent;
        } catch {
          return;
        }

        const agent = event.agent as AgentKey;
        const type = event.type;
        const data = event.data;

        addLog({ time: now(), agent: event.agent, type, message: data });

        if (type === "thinking") {
          setStatus(agent, "thinking");
        } else if (type === "token") {
          appendToken(agent, data);
        } else if (type === "tool_call") {
          addToolCall(agent, data);
        } else if (type === "complete") {
          setStatus(agent, "complete");
        } else if (type === "error") {
          setStatus(agent, "error");
        } else if (type === "done") {
          setRunning(false);
          es.close();
        }
      };

      es.onerror = () => {
        es.close();
        // Reconnect after 2 s if still running
        const store = useAgentStore.getState();
        if (store.isRunning) {
          setTimeout(connect, 2000);
        }
      };
    };

    setRunning(true);
    connect();

    return () => {
      esRef.current?.close();
    };
  }, [jobId, appendToken, setStatus, addToolCall, addLog, setRunning]);
}
