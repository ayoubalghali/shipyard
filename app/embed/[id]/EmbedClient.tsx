"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface AgentParam {
  name: string;
  type: "text" | "textarea" | "select" | "number";
  required: boolean;
  defaultValue: string;
  helpText?: string;
  options?: string[];
}

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: AgentParam[];
}

export default function EmbedClient({ agentId }: { agentId: string }) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);

  // Fetch agent metadata
  useEffect(() => {
    fetch(`/api/agents/${agentId}`)
      .then((r) => r.json() as Promise<{ agent: Agent }>)
      .then((d) => {
        setAgent(d.agent);
        // Pre-fill defaults
        const defaults: Record<string, string> = {};
        (d.agent.parameters ?? []).forEach((p: AgentParam) => { defaults[p.name] = p.defaultValue ?? ""; });
        setParamValues(defaults);
      })
      .catch(() => setError("Agent not found"))
      .finally(() => setLoading(false));
  }, [agentId]);

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current && isRunning) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, isRunning]);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("");
    setError("");

    // Notify host page run started
    window.parent.postMessage({ type: "shipyard:run_start", agentId }, "*");

    try {
      const res = await fetch(`/api/agents/${agentId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_data: paramValues, model: "ollama" }),
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6)) as { type: string; chunk?: string; output?: string };
            if (parsed.type === "chunk" && parsed.chunk) {
              accumulated += parsed.chunk;
              setOutput(accumulated);
            } else if (parsed.type === "done") {
              // Notify host page
              window.parent.postMessage({ type: "shipyard:run_complete", agentId, output: accumulated }, "*");
            }
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Execution failed");
      window.parent.postMessage({ type: "shipyard:run_error", agentId, error: String(err) }, "*");
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center bg-[#0A0E27]">
        <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !agent) {
    return (
      <div className="min-h-[200px] flex items-center justify-center bg-[#0A0E27] text-[#EF4444] text-sm p-4">
        {error}
      </div>
    );
  }

  if (!agent) return null;

  const params = agent.parameters ?? [];

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white flex flex-col" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Minimal header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2A3A4E]">
        <div className="w-6 h-6 bg-[#2563EB] rounded flex items-center justify-center flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M2 14L9 4L16 14H2Z" fill="white" />
            <circle cx="9" cy="14" r="2" fill="#00D9FF" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{agent.name}</p>
          <p className="text-[10px] text-[#6B7280] truncate">{agent.category}</p>
        </div>
        <Link
          href={`/agent/${agent.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-[#2563EB] hover:text-[#00D9FF] transition-colors flex-shrink-0"
          aria-label="Open full agent page"
        >
          Open ↗
        </Link>
      </div>

      {/* Inputs */}
      <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto">
        {params.length === 0 ? (
          <p className="text-xs text-[#6B7280]">No parameters required.</p>
        ) : (
          params.map((param) => (
            <div key={param.name}>
              <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
                {param.name}
                {param.required && <span className="text-[#EF4444] ml-0.5" aria-hidden="true">*</span>}
              </label>
              {param.type === "textarea" ? (
                <textarea
                  rows={3}
                  value={paramValues[param.name] ?? ""}
                  onChange={(e) => setParamValues((p) => ({ ...p, [param.name]: e.target.value }))}
                  placeholder={param.helpText ?? ""}
                  className="w-full rounded-lg border border-[#2A3A4E] bg-[#1A2332] px-3 py-2 text-sm text-white placeholder-[#4B5563] focus:border-[#00D9FF] focus:outline-none resize-none"
                />
              ) : param.type === "select" ? (
                <select
                  value={paramValues[param.name] ?? ""}
                  onChange={(e) => setParamValues((p) => ({ ...p, [param.name]: e.target.value }))}
                  className="w-full rounded-lg border border-[#2A3A4E] bg-[#1A2332] px-3 py-2 text-sm text-white focus:border-[#00D9FF] focus:outline-none"
                >
                  {(param.options ?? []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={param.type === "number" ? "number" : "text"}
                  value={paramValues[param.name] ?? ""}
                  onChange={(e) => setParamValues((p) => ({ ...p, [param.name]: e.target.value }))}
                  placeholder={param.helpText ?? ""}
                  className="w-full rounded-lg border border-[#2A3A4E] bg-[#1A2332] px-3 py-2 text-sm text-white placeholder-[#4B5563] focus:border-[#00D9FF] focus:outline-none"
                />
              )}
            </div>
          ))
        )}

        {/* Output */}
        {(output || isRunning) && (
          <div>
            <p className="text-xs font-medium text-[#6B7280] mb-1 uppercase tracking-wider">Output</p>
            <div
              ref={outputRef}
              className="rounded-lg border border-[#2A3A4E] bg-[#050810] p-3 max-h-40 overflow-y-auto"
              aria-live="polite"
            >
              {isRunning && !output && (
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <div className="w-3 h-3 border border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                  Running…
                </div>
              )}
              <pre className="whitespace-pre-wrap text-xs text-[#A3A3A3] font-mono leading-relaxed">{output}</pre>
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-[#EF4444] rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {/* Footer with run button */}
      <div className="px-4 py-3 border-t border-[#2A3A4E]">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="w-full rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 py-2.5 text-sm font-medium text-white transition-colors"
        >
          {isRunning ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Running…
            </span>
          ) : "Run Agent"}
        </button>
        <p className="text-center mt-2 text-[10px] text-[#4B5563]">
          Powered by{" "}
          <Link href="https://shipyard.ai" target="_blank" rel="noopener noreferrer" className="text-[#2563EB] hover:text-[#00D9FF]">
            Shipyard
          </Link>
        </p>
      </div>
    </div>
  );
}
