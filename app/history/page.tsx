"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface ExecutionRecord {
  id: string;
  input_data: Record<string, string>;
  output: string;
  model_used: string;
  tokens_input: number;
  tokens_output: number;
  execution_time_ms: number;
  status: string;
  created_at: string;
  agent: { id: string; name: string; category: string };
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatMs(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
  }, [status, router]);

  const fetchPage = useCallback(async (offset: number) => {
    try {
      const res = await fetch(`/api/user/executions?limit=20&offset=${offset}`);
      const data = await res.json() as {
        executions?: ExecutionRecord[];
        total?: number;
        hasMore?: boolean;
      };
      return { execs: data.executions ?? [], total: data.total ?? 0, hasMore: data.hasMore ?? false };
    } catch {
      return { execs: [], total: 0, hasMore: false };
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetchPage(0)
      .then(({ execs, total: t, hasMore: hm }) => {
        setExecutions(execs);
        setTotal(t);
        setHasMore(hm);
      })
      .finally(() => setLoading(false));
  }, [status, fetchPage]);

  const loadMore = async () => {
    setLoadingMore(true);
    const { execs, hasMore: hm } = await fetchPage(executions.length);
    setExecutions((prev) => [...prev, ...execs]);
    setHasMore(hm);
    setLoadingMore(false);
  };

  const copyOutput = async (id: string, output: string) => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {/* non-fatal */}
  };

  if (status === "loading" || (loading && executions.length === 0)) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main id="main-content" className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Execution History</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {total > 0
              ? `${total} run${total !== 1 ? "s" : ""} across all agents`
              : "No executions yet — run an agent to see history here."}
          </p>
        </div>

        {!session?.user && (
          <div className="text-center py-16 text-[#6B7280]">
            <p className="text-sm">Sign in to view your execution history.</p>
          </div>
        )}

        {session?.user && executions.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🤖</p>
            <h2 className="text-lg font-semibold text-white mb-2">No runs yet</h2>
            <p className="text-sm text-[#6B7280] mb-5">
              Run an agent to see your history here.
            </p>
            <Link
              href="/explore"
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Explore Agents
            </Link>
          </div>
        )}

        <AnimatePresence>
          <div className="space-y-3">
            {executions.map((exec, idx) => {
              const isExpanded = expanded === exec.id;
              const inputPreview = Object.values(exec.input_data ?? {}).join(" ").slice(0, 80);
              const outputPreview = exec.output?.slice(0, 120);

              return (
                <motion.div
                  key={exec.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx < 5 ? idx * 0.04 : 0 }}
                  className="bg-[#0A0E27] border border-[#2A3A4E] rounded-lg overflow-hidden"
                >
                  {/* Header row */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : exec.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#0D1535] transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      exec.status === "success" ? "bg-[#10B981]" :
                      exec.status === "error" ? "bg-[#EF4444]" : "bg-[#F59E0B]"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/agent/${exec.agent.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm font-medium text-white hover:text-[#00D9FF] transition-colors"
                        >
                          {exec.agent.name}
                        </Link>
                        <span className="text-xs px-1.5 py-0.5 bg-[#1A2332] rounded text-[#6B7280]">
                          {exec.agent.category}
                        </span>
                        <span className="text-xs text-[#4B5563]">{exec.model_used}</span>
                      </div>
                      {inputPreview && (
                        <p className="text-xs text-[#6B7280] mt-0.5 truncate">{inputPreview}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 text-xs text-[#4B5563] space-y-0.5">
                      <p>{timeAgo(exec.created_at)}</p>
                      <p>{formatMs(exec.execution_time_ms)}</p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-[#6B7280] transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-[#2A3A4E]"
                      >
                        <div className="p-4 space-y-4">
                          {/* Stats row */}
                          <div className="flex gap-4 text-xs text-[#6B7280] flex-wrap">
                            <span>Tokens in: <span className="text-[#A3A3A3]">{exec.tokens_input}</span></span>
                            <span>Tokens out: <span className="text-[#A3A3A3]">{exec.tokens_output}</span></span>
                            <span>Time: <span className="text-[#A3A3A3]">{formatMs(exec.execution_time_ms)}</span></span>
                            <span>Model: <span className="text-[#A3A3A3]">{exec.model_used}</span></span>
                          </div>

                          {/* Input */}
                          {Object.keys(exec.input_data ?? {}).length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">Input</p>
                              <div className="bg-[#1A2332] rounded-md p-3 text-xs text-[#A3A3A3] space-y-1 font-mono">
                                {Object.entries(exec.input_data ?? {}).map(([k, v]) => (
                                  <div key={k}>
                                    <span className="text-[#6B7280]">{k}:</span>{" "}
                                    <span className="text-[#E2E8F0]">{String(v)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Output */}
                          {exec.output && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Output</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => copyOutput(exec.id, exec.output)}
                                    className="text-xs text-[#6B7280] hover:text-[#00D9FF] transition-colors"
                                  >
                                    {copied === exec.id ? "Copied!" : "Copy"}
                                  </button>
                                  <Link
                                    href={`/agent/${exec.agent.id}`}
                                    className="text-xs text-[#2563EB] hover:text-[#00D9FF] transition-colors"
                                  >
                                    Re-run →
                                  </Link>
                                </div>
                              </div>
                              <div className="bg-[#1A2332] rounded-md p-3 text-xs text-[#A3A3A3] max-h-48 overflow-y-auto font-mono whitespace-pre-wrap leading-relaxed">
                                {outputPreview}
                                {(exec.output?.length ?? 0) > 120 && !isExpanded && "…"}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        {hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-5 py-2.5 border border-[#2A3A4E] hover:border-[#2563EB] rounded-lg text-sm text-[#A3A3A3] hover:text-white transition-colors disabled:opacity-50"
            >
              {loadingMore ? "Loading…" : "Load More"}
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
