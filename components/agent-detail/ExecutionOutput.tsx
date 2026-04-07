"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

export interface ExecutionRun {
  id: string;
  timestamp: Date;
  output: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  executionTimeMs: number;
  status: "success" | "error";
}

interface ExecutionOutputProps {
  agentId: string;
  inputData: Record<string, string>;
  model: "claude" | "ollama";
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  onRunStart: () => void;
  onRunComplete: (run: ExecutionRun) => void;
  isRunning: boolean;
  setIsRunning: (v: boolean) => void;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center gap-3 py-8" aria-live="polite" aria-label="Running agent">
      <svg
        className="h-5 w-5 animate-spin text-[#2563EB]"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="text-sm text-[#A3A3A3]">Running agent...</span>
    </div>
  );
}

export default function ExecutionOutput({
  agentId,
  inputData,
  model,
  temperature,
  maxTokens,
  systemPrompt,
  onRunStart,
  onRunComplete,
  isRunning,
  setIsRunning,
}: ExecutionOutputProps) {
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [meta, setMeta] = useState<{ tokensIn: number; tokensOut: number; ms: number } | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll output as it streams
  useEffect(() => {
    if (outputRef.current && isRunning) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, isRunning]);

  // Live elapsed timer
  useEffect(() => {
    if (isRunning && startTime !== null) {
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTime);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, startTime]);

  const run = async () => {
    setOutput("");
    setError(null);
    setMeta(null);
    setElapsedMs(null);
    const t0 = Date.now();
    setStartTime(t0);
    setIsRunning(true);
    onRunStart();

    abortRef.current = new AbortController();

    try {
      const res = await fetch(`/api/agents/${agentId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_data: inputData, model, temperature, max_tokens: maxTokens, system_prompt: systemPrompt }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let finalOutput = "";
      let status: "success" | "error" = "success";
      let runMeta = { tokensIn: 0, tokensOut: 0, ms: 0 };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = dec.decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          try {
            const parsed = JSON.parse(data) as {
              type: string;
              content?: string;
              message?: string;
              tokens_input?: number;
              tokens_output?: number;
              execution_time_ms?: number;
            };

            if (parsed.type === "content" && parsed.content) {
              finalOutput += parsed.content;
              setOutput(finalOutput);
            } else if (parsed.type === "error") {
              status = "error";
              setError(parsed.message ?? "Unknown error occurred");
              finalOutput = parsed.message ?? "";
            } else if (parsed.type === "end") {
              runMeta = {
                tokensIn: parsed.tokens_input ?? 0,
                tokensOut: parsed.tokens_output ?? 0,
                ms: parsed.execution_time_ms ?? Date.now() - t0,
              };
              setMeta(runMeta);
              setElapsedMs(runMeta.ms);
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }

      const run: ExecutionRun = {
        id: `run_${Date.now()}`,
        timestamp: new Date(),
        output: finalOutput,
        model,
        tokensIn: runMeta.tokensIn,
        tokensOut: runMeta.tokensOut,
        executionTimeMs: runMeta.ms,
        status,
      };
      onRunComplete(run);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Request failed";
      setError(msg);
      onRunComplete({
        id: `run_${Date.now()}`,
        timestamp: new Date(),
        output: "",
        model,
        tokensIn: 0,
        tokensOut: 0,
        executionTimeMs: Date.now() - t0,
        status: "error",
      });
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    setIsRunning(false);
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  const hasOutput = output.length > 0;
  const hasError = !!error && !hasOutput;

  return (
    <div className="flex flex-col gap-4">
      {/* Run / Stop button */}
      <div className="flex gap-3">
        <button
          onClick={isRunning ? stop : run}
          disabled={!isRunning && Object.values(inputData).every((v) => !v.trim())}
          className={`flex flex-1 items-center justify-center gap-2 rounded-[6px] px-5 py-3 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF] disabled:cursor-not-allowed disabled:opacity-40 ${
            isRunning
              ? "border border-[#EF4444] bg-[#0A0E27] text-[#EF4444] hover:bg-[#1A2332]"
              : "bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF]"
          }`}
          aria-label={isRunning ? "Stop agent execution" : "Run agent"}
        >
          {isRunning ? (
            <>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              Stop
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
              Run Agent
            </>
          )}
        </button>
      </div>

      {/* Output area */}
      <AnimatePresence>
        {(isRunning || hasOutput || hasError) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27]"
          >
            {/* Output header */}
            <div className="flex items-center justify-between border-b border-[#2A3A4E] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#6B7280]">Output</span>
                {isRunning && (
                  <span className="flex items-center gap-1 rounded-full border border-[#2563EB]/30 bg-[#2563EB]/10 px-2 py-0.5 text-[11px] text-[#2563EB]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] animate-pulse" aria-hidden="true" />
                    Streaming
                  </span>
                )}
                {hasError && (
                  <span className="rounded-full border border-[#EF4444]/30 bg-[#EF4444]/10 px-2 py-0.5 text-[11px] text-[#EF4444]">
                    Error
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* Elapsed time */}
                {(isRunning || elapsedMs !== null) && (
                  <span className="font-mono text-[11px] text-[#6B7280]">
                    {((elapsedMs ?? 0) / 1000).toFixed(1)}s
                  </span>
                )}
                {/* Copy button */}
                {hasOutput && (
                  <button
                    onClick={copyOutput}
                    className="flex items-center gap-1.5 text-xs text-[#6B7280] transition-colors hover:text-[#00D9FF]"
                    aria-label="Copy output to clipboard"
                  >
                    {copied ? (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Output content */}
            <div
              ref={outputRef}
              className="max-h-[600px] overflow-y-auto p-4"
              aria-live="polite"
              aria-atomic="false"
            >
              {isRunning && !hasOutput && <LoadingSpinner />}

              {hasError && (
                <div className="flex items-start gap-3 rounded-[6px] border border-[#EF4444]/20 bg-[#EF4444]/5 p-3">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-[#EF4444]">{error}</p>
                </div>
              )}

              {hasOutput && (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Style code blocks to match design system
                      code({ className, children, ...props }) {
                        const isInline = !className;
                        return isInline ? (
                          <code
                            className="rounded-[3px] bg-[#1A2332] px-1.5 py-0.5 font-mono text-xs text-[#00D9FF]"
                            {...props}
                          >
                            {children}
                          </code>
                        ) : (
                          <code
                            className={`block rounded-[6px] bg-[#1A2332] p-3 font-mono text-xs text-[#A3A3A3] ${className ?? ""}`}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      a({ href, children }) {
                        return (
                          <a href={href} className="text-[#00D9FF] hover:underline" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        );
                      },
                    }}
                  >
                    {output}
                  </ReactMarkdown>
                  {/* Streaming cursor */}
                  {isRunning && (
                    <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[#00D9FF]" aria-hidden="true" />
                  )}
                </div>
              )}
            </div>

            {/* Metadata footer */}
            {meta && (
              <div className="flex flex-wrap items-center gap-4 border-t border-[#2A3A4E] px-4 py-2.5">
                <span className="text-[11px] text-[#6B7280]">
                  <span className="text-[#A3A3A3]">{meta.tokensIn}</span> tokens in
                </span>
                <span className="text-[11px] text-[#6B7280]">
                  <span className="text-[#A3A3A3]">{meta.tokensOut}</span> tokens out
                </span>
                <span className="text-[11px] text-[#6B7280]">
                  <span className="text-[#A3A3A3]">{(meta.ms / 1000).toFixed(2)}s</span> total
                </span>
                <span className="text-[11px] text-[#6B7280]">
                  via <span className="text-[#A3A3A3]">{model}</span>
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
