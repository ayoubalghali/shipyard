"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBuilderStore } from "@/store/builderStore";
import AgentCard from "@/components/agents/AgentCard";
import { Agent } from "@/lib/types";

type PublishStatus = "idle" | "publishing" | "success" | "error";

export default function Step5Review() {
  const router = useRouter();
  const state = useBuilderStore();
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("idle");
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedId, setPublishedId] = useState<string | null>(null);

  // Build preview agent for the AgentCard
  const previewAgent: Agent = {
    id: "preview",
    name: state.name || "Your Agent Name",
    description: state.description || "Your agent description will appear here.",
    category: state.category,
    tags: state.tags,
    rating: 0,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    creator: {
      id: "me",
      name: "You",
      avatar: "YO",
      isVerified: false,
    },
    parameters: state.parameters,
    defaultModel: state.defaultModel,
    temperature: state.temperature,
    maxTokens: state.maxTokens,
  };

  const handlePublish = async () => {
    setPublishStatus("publishing");
    setPublishError(null);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name,
          description: state.description,
          category: state.category,
          tags: state.tags,
          prompt: state.prompt,
          parameters: state.parameters,
          default_model: state.defaultModel,
          temperature: state.temperature,
          max_tokens: state.maxTokens,
          system_prompt: state.systemPrompt,
          is_public: state.visibility === "public",
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to publish agent");
      }

      const data = (await res.json()) as { agent: { id: string } };
      setPublishedId(data.agent.id);
      setPublishStatus("success");
      state.reset();
    } catch (err) {
      setPublishStatus("error");
      setPublishError(err instanceof Error ? err.message : "Failed to publish");
    }
  };

  const handleSaveDraft = () => {
    // Draft is auto-saved to localStorage via the Zustand persist middleware
    router.push("/");
  };

  const handleCancel = () => {
    if (window.confirm("Cancel? Your draft is saved and you can continue later.")) {
      router.push("/");
    }
  };

  // Show success state
  if (publishStatus === "success" && publishedId) {
    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#10B981]/10 text-4xl">
          🚀
        </div>
        <div>
          <h2 className="text-[24px] font-semibold text-white">Agent Published!</h2>
          <p className="mt-2 text-sm text-[#A3A3A3]">
            Your agent is live on the Shipyard marketplace.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => router.push(`/agent/${publishedId}`)}
            className="rounded-[6px] bg-[#2563EB] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#1D4ED8]"
          >
            View Agent →
          </button>
          <button
            onClick={() => router.push("/")}
            className="rounded-[6px] border border-[#2A3A4E] px-6 py-2.5 text-sm font-medium text-[#00D9FF] transition-all hover:border-[#2563EB] hover:bg-[#0A0E27]"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[24px] font-semibold leading-[1.3] text-white">Review & Publish</h2>
        <p className="mt-1 text-sm text-[#A3A3A3]">
          Here&apos;s a preview of how your agent will appear on the marketplace.
        </p>
      </div>

      {/* Card preview */}
      <div className="max-w-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
          Marketplace Card Preview
        </p>
        <AgentCard agent={previewAgent} />
      </div>

      {/* Summary */}
      <div className="rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] divide-y divide-[#2A3A4E]">
        <h3 className="px-4 py-3 text-sm font-semibold text-white">Agent Summary</h3>

        {[
          { label: "Name", value: state.name || "—" },
          { label: "Category", value: state.category },
          { label: "Model", value: state.defaultModel === "ollama" ? "Ollama (Local)" : "Claude AI" },
          { label: "Visibility", value: state.visibility === "public" ? "Public — listed on marketplace" : "Private — only you" },
          {
            label: "Parameters",
            value: state.parameters.length > 0
              ? state.parameters.map((p) => `{{${p.name}}}${p.required ? "*" : ""}`).join(", ")
              : "None",
          },
          { label: "Temperature", value: state.temperature.toFixed(1) },
          { label: "Max Tokens", value: state.maxTokens.toLocaleString() },
          { label: "Tags", value: state.tags.length > 0 ? state.tags.map((t) => `#${t}`).join(", ") : "None" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-start gap-4 px-4 py-3">
            <span className="w-28 shrink-0 text-xs font-medium text-[#6B7280]">{label}</span>
            <span className="text-sm text-[#A3A3A3]">{value}</span>
          </div>
        ))}
      </div>

      {/* Prompt preview */}
      <div className="rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27]">
        <div className="border-b border-[#2A3A4E] px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Prompt</h3>
        </div>
        <pre className="max-h-40 overflow-y-auto p-4 font-mono text-xs text-[#A3A3A3] whitespace-pre-wrap">
          {state.prompt || "No prompt set"}
        </pre>
      </div>

      {/* Error */}
      {publishStatus === "error" && publishError && (
        <div className="flex items-start gap-3 rounded-[6px] border border-[#EF4444]/20 bg-[#EF4444]/5 p-3">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-[#EF4444]">Publish failed</p>
            <p className="mt-0.5 text-xs text-[#EF4444]/80">{publishError}</p>
          </div>
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handlePublish}
          disabled={publishStatus === "publishing"}
          className="flex flex-1 items-center justify-center gap-2 rounded-[6px] bg-[#2563EB] px-5 py-3 text-sm font-medium text-white transition-all hover:bg-[#1D4ED8] active:bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {publishStatus === "publishing" ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Publishing…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Publish Agent
            </>
          )}
        </button>
        <button
          onClick={handleSaveDraft}
          disabled={publishStatus === "publishing"}
          className="flex items-center justify-center gap-2 rounded-[6px] border border-[#2A3A4E] px-5 py-3 text-sm font-medium text-[#00D9FF] transition-all hover:border-[#2563EB] hover:bg-[#0A0E27] disabled:opacity-60"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save as Draft
        </button>
        <button
          onClick={handleCancel}
          disabled={publishStatus === "publishing"}
          className="flex items-center justify-center gap-2 rounded-[6px] px-5 py-3 text-sm font-medium text-[#6B7280] transition-all hover:text-white disabled:opacity-60"
        >
          Cancel
        </button>
      </div>

      <p className="text-center text-xs text-[#4B5563]">
        Your draft is automatically saved. You can close and return anytime.
      </p>
    </div>
  );
}
