"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AdvancedOptionsProps {
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  onTemperatureChange: (v: number) => void;
  onMaxTokensChange: (v: number) => void;
  onSystemPromptChange: (v: string) => void;
  disabled?: boolean;
}

export default function AdvancedOptions({
  temperature,
  maxTokens,
  systemPrompt,
  onTemperatureChange,
  onMaxTokensChange,
  onSystemPromptChange,
  disabled,
}: AdvancedOptionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[8px] border border-[#2A3A4E]">
      <button
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-controls="advanced-options-panel"
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-[#A3A3A3] transition-colors hover:text-white"
      >
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Advanced Options
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
            id="advanced-options-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-5 border-t border-[#2A3A4E] px-4 py-4">
              {/* Temperature slider */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="temperature" className="text-sm font-medium text-white">
                    Temperature
                  </label>
                  <span className="rounded-[4px] bg-[#1A2332] px-2 py-0.5 font-mono text-xs text-[#00D9FF]">
                    {temperature.toFixed(1)}
                  </span>
                </div>
                <p className="mb-2 text-xs text-[#6B7280]">
                  Lower = more focused. Higher = more creative.
                </p>
                <input
                  type="range"
                  id="temperature"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
                  disabled={disabled}
                  aria-valuemin={0}
                  aria-valuemax={1}
                  aria-valuenow={temperature}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#2A3A4E] accent-[#2563EB] disabled:opacity-50"
                />
                <div className="mt-1 flex justify-between text-[10px] text-[#4B5563]">
                  <span>Precise (0.0)</span>
                  <span>Creative (1.0)</span>
                </div>
              </div>

              {/* Max tokens */}
              <div>
                <label htmlFor="max-tokens" className="mb-1.5 block text-sm font-medium text-white">
                  Max Tokens
                </label>
                <p className="mb-2 text-xs text-[#6B7280]">
                  Maximum length of the response (100–4000).
                </p>
                <input
                  type="number"
                  id="max-tokens"
                  min={100}
                  max={4000}
                  step={100}
                  value={maxTokens}
                  onChange={(e) => onMaxTokensChange(parseInt(e.target.value, 10))}
                  disabled={disabled}
                  className="w-full rounded-[6px] border border-[#2A3A4E] bg-[#1A2332] px-3 py-2 text-sm text-white transition-all focus:border-[#00D9FF] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] disabled:opacity-50"
                />
              </div>

              {/* System prompt override */}
              <div>
                <label htmlFor="system-prompt" className="mb-1.5 block text-sm font-medium text-white">
                  System Prompt Override{" "}
                  <span className="text-[#6B7280]">(optional)</span>
                </label>
                <p className="mb-2 text-xs text-[#6B7280]">
                  Replaces the agent&apos;s built-in system prompt.
                </p>
                <textarea
                  id="system-prompt"
                  value={systemPrompt}
                  onChange={(e) => onSystemPromptChange(e.target.value)}
                  placeholder="You are a helpful assistant..."
                  rows={3}
                  disabled={disabled}
                  className="w-full resize-y rounded-[6px] border border-[#2A3A4E] bg-[#1A2332] px-3 py-2 font-mono text-xs text-white placeholder-[#6B7280] transition-all focus:border-[#00D9FF] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] disabled:opacity-50"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
