"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExecutionRun } from "@/components/agent-detail/ExecutionOutput";

interface PreviousRunsProps {
  runs: ExecutionRun[];
  onSelect: (run: ExecutionRun) => void;
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  return `${Math.floor(diffSec / 3600)}h ago`;
}

export default function PreviousRuns({ runs, onSelect }: PreviousRunsProps) {
  const [open, setOpen] = useState(false);

  if (runs.length === 0) return null;

  return (
    <div className="rounded-[8px] border border-[#2A3A4E]">
      <button
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-controls="previous-runs-panel"
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-[#A3A3A3] transition-colors hover:text-white"
      >
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Previous Runs
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1A2332] text-[11px] font-semibold text-[#A3A3A3]">
            {runs.length}
          </span>
        </span>
        <svg
          className={`h-4 w-4 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="previous-runs-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col border-t border-[#2A3A4E]">
              {runs.map((run, i) => (
                <button
                  key={run.id}
                  onClick={() => {
                    onSelect(run);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-[#0A0E27] focus:outline-none focus-visible:bg-[#0A0E27]"
                  aria-label={`Load run ${i + 1} from ${formatRelativeTime(run.timestamp)}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Status dot */}
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        run.status === "success" ? "bg-[#10B981]" : "bg-[#EF4444]"
                      }`}
                      aria-label={run.status}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[#A3A3A3] max-w-[220px]">
                        {run.output
                          ? run.output.slice(0, 60).replace(/\n/g, " ") + (run.output.length > 60 ? "…" : "")
                          : run.status === "error"
                          ? "Run failed"
                          : "Empty output"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#4B5563]">
                        {formatRelativeTime(run.timestamp)} · {run.model} ·{" "}
                        {(run.executionTimeMs / 1000).toFixed(1)}s
                      </p>
                    </div>
                  </div>
                  <svg
                    className="ml-3 h-3.5 w-3.5 shrink-0 text-[#4B5563]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
