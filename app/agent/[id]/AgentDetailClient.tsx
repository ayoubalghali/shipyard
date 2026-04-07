"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Agent, AgentParameter, Creator } from "@/lib/types";
import AgentSidebar from "@/components/agent-detail/AgentSidebar";
import ParameterForm from "@/components/agent-detail/ParameterForm";
import ModelSelector from "@/components/agent-detail/ModelSelector";
import AdvancedOptions from "@/components/agent-detail/AdvancedOptions";
import ExecutionOutput, { ExecutionRun } from "@/components/agent-detail/ExecutionOutput";
import PreviousRuns from "@/components/agent-detail/PreviousRuns";

interface AgentDetailClientProps {
  agent: Agent & { parameters: AgentParameter[] };
  creator: Creator;
  related: Agent[];
}

const MAX_RUNS = 5;

export default function AgentDetailClient({
  agent,
  creator,
  related,
}: AgentDetailClientProps) {
  // Form state
  const [paramValues, setParamValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    for (const p of agent.parameters ?? []) {
      if (p.defaultValue) defaults[p.name] = p.defaultValue;
    }
    return defaults;
  });
  const [paramErrors, setParamErrors] = useState<Record<string, string>>({});

  // Model & advanced settings
  const [model, setModel] = useState<"claude" | "ollama">(
    (agent.defaultModel as "claude" | "ollama") ?? "ollama"
  );
  const [temperature, setTemperature] = useState(agent.temperature ?? 0.7);
  const [maxTokens, setMaxTokens] = useState(agent.maxTokens ?? 2000);
  const [systemPrompt, setSystemPrompt] = useState("");

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [runs, setRuns] = useState<ExecutionRun[]>([]);
  const [restoredOutput, setRestoredOutput] = useState<string | null>(null);

  const handleParamChange = useCallback((name: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    setParamErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    for (const p of agent.parameters ?? []) {
      if (p.required && !paramValues[p.name]?.trim()) {
        errors[p.name] = "This field is required";
      }
      if (p.type === "number" && paramValues[p.name] && isNaN(Number(paramValues[p.name]))) {
        errors[p.name] = "Must be a number";
      }
    }
    setParamErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRunStart = useCallback(() => {
    if (!validate()) return;
    setRestoredOutput(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramValues, agent.parameters]);

  const handleRunComplete = useCallback((run: ExecutionRun) => {
    setRuns((prev) => [run, ...prev].slice(0, MAX_RUNS));
  }, []);

  const handleSelectRun = useCallback((run: ExecutionRun) => {
    setRestoredOutput(run.output);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Breadcrumb */}
      <div className="border-b border-[#2A3A4E] bg-[#000000]/80 px-4 py-3 sm:px-8">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl">
          <ol className="flex items-center gap-2 text-sm text-[#6B7280]">
            <li>
              <Link href="/" className="transition-colors hover:text-[#00D9FF]">
                Marketplace
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <span className="text-[#A3A3A3]">{agent.category}</span>
            </li>
            <li aria-hidden="true">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <span className="text-white" aria-current="page">
                {agent.name}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left sidebar — 30% */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full lg:w-72 xl:w-80 shrink-0"
          >
            <div className="lg:sticky lg:top-24">
              <AgentSidebar agent={agent} creator={creator} related={related} />
            </div>
          </motion.div>

          {/* Main content — 70% */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="flex-1 min-w-0"
          >
            <div className="flex flex-col gap-6">
              {/* Input Parameters */}
              <section
                aria-labelledby="parameters-heading"
                className="rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] p-6"
              >
                <h2
                  id="parameters-heading"
                  className="mb-5 text-[18px] font-semibold leading-[1.4] text-white"
                >
                  Input Parameters
                </h2>
                <ParameterForm
                  parameters={agent.parameters ?? []}
                  values={paramValues}
                  errors={paramErrors}
                  onChange={handleParamChange}
                  disabled={isRunning}
                />
              </section>

              {/* Model Selection */}
              <section aria-labelledby="model-heading">
                <ModelSelector
                  value={model}
                  onChange={setModel}
                  disabled={isRunning}
                />
              </section>

              {/* Advanced Options */}
              <AdvancedOptions
                temperature={temperature}
                maxTokens={maxTokens}
                systemPrompt={systemPrompt}
                onTemperatureChange={setTemperature}
                onMaxTokensChange={setMaxTokens}
                onSystemPromptChange={setSystemPrompt}
                disabled={isRunning}
              />

              {/* Execution Output (contains Run button) */}
              <section aria-labelledby="output-heading">
                <h2
                  id="output-heading"
                  className="mb-3 text-[18px] font-semibold leading-[1.4] text-white sr-only"
                >
                  Run Agent
                </h2>
                <ExecutionOutput
                  agentId={agent.id}
                  inputData={paramValues}
                  model={model}
                  temperature={temperature}
                  maxTokens={maxTokens}
                  systemPrompt={systemPrompt}
                  onRunStart={handleRunStart}
                  onRunComplete={handleRunComplete}
                  isRunning={isRunning}
                  setIsRunning={setIsRunning}
                />

                {/* Restored run preview */}
                {restoredOutput && (
                  <div className="mt-4 rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] p-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                      Restored from history
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-[#A3A3A3]">
                      {restoredOutput}
                    </p>
                  </div>
                )}
              </section>

              {/* Previous Runs */}
              {runs.length > 0 && (
                <section aria-labelledby="runs-heading">
                  <h2 id="runs-heading" className="sr-only">Previous runs</h2>
                  <PreviousRuns runs={runs} onSelect={handleSelectRun} />
                </section>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
