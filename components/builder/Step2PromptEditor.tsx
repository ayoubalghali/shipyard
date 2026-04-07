"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useBuilderStore } from "@/store/builderStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Debounce helper
function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

// Highlight {{parameter}} patterns inline
export function HighlightedPrompt({ text }: { text: string }) {
  const parts = text.split(/({{[^}]+}})/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith("{{") ? (
          <mark
            key={i}
            className="rounded-[2px] bg-[#00D9FF]/15 text-[#00D9FF] not-italic"
            style={{ backgroundColor: "rgba(0,217,255,0.12)", color: "#00D9FF" }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

type PreviewStatus = "idle" | "loading" | "success" | "error" | "timeout";

export default function Step2PromptEditor() {
  const { prompt, setPrompt, parameters, errors } = useBuilderStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewOutput, setPreviewOutput] = useState("");
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>("idle");
  const abortRef = useRef<AbortController | null>(null);

  const debouncedPrompt = useDebounce(prompt, 800);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  // Build a sample input from parameters
  const getSampleInput = useCallback(() => {
    const sample: Record<string, string> = {};
    for (const p of parameters) {
      sample[p.name] = p.defaultValue || `[sample ${p.name}]`;
    }
    return sample;
  }, [parameters]);

  const runPreview = useCallback(async () => {
    if (!prompt.trim() || previewStatus === "loading") return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setPreviewOutput("");
    setPreviewStatus("loading");

    // Build interpolated prompt
    let finalPrompt = prompt;
    const sample = getSampleInput();
    for (const [key, val] of Object.entries(sample)) {
      finalPrompt = finalPrompt.replace(new RegExp(`{{${key}}}`, "g"), val);
    }

    const timeout = setTimeout(() => {
      abortRef.current?.abort();
      setPreviewStatus("timeout");
    }, 15_000);

    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, model: "ollama" }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Preview failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let out = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6)) as { type: string; content?: string; message?: string };
            if (parsed.type === "content" && parsed.content) {
              out += parsed.content;
              setPreviewOutput(out);
            }
            if (parsed.type === "error") throw new Error(parsed.message);
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
      setPreviewStatus("success");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setPreviewStatus("error");
      setPreviewOutput(err instanceof Error ? err.message : "Preview failed");
    } finally {
      clearTimeout(timeout);
    }
  }, [prompt, getSampleInput, previewStatus]);

  // Auto-run preview when prompt changes (debounced)
  useEffect(() => {
    if (showPreview && debouncedPrompt) {
      runPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPrompt, showPreview]);

  // Extract {{parameter}} references from the prompt
  const referencedParams = Array.from(new Set(Array.from(prompt.matchAll(/{{([^}]+)}}/g)).map((m) => m[1])));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[24px] font-semibold leading-[1.3] text-white">Prompt Editor</h2>
        <p className="mt-1 text-sm text-[#A3A3A3]">
          Write the instructions that tell the AI what to do. Use{" "}
          <code className="rounded-[3px] bg-[#1A2332] px-1.5 py-0.5 font-mono text-xs text-[#00D9FF]">
            {"{{parameter_name}}"}
          </code>{" "}
          to insert user inputs into the prompt.
        </p>
      </div>

      <div className="rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] overflow-hidden">
        {/* Editor toolbar */}
        <div className="flex items-center justify-between border-b border-[#2A3A4E] px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[#6B7280]">PROMPT</span>
            {referencedParams.length > 0 && (
              <div className="flex items-center gap-1.5">
                {referencedParams.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-[#00D9FF]/20 bg-[#00D9FF]/5 px-2 py-0.5 font-mono text-[10px] text-[#00D9FF]"
                  >
                    {`{{${p}}}`}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#4B5563]">{prompt.length} chars</span>
            <button
              type="button"
              onClick={() => {
                setShowPreview((p) => !p);
                if (!showPreview) runPreview();
              }}
              className={`flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-xs font-medium transition-all ${
                showPreview
                  ? "bg-[#2563EB]/10 text-[#2563EB]"
                  : "text-[#A3A3A3] hover:text-white"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          </div>
        </div>

        <div className={`grid ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"}`}>
          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              id="prompt-editor"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="You are a helpful AI assistant.&#10;&#10;User input: {{input}}&#10;&#10;Provide a detailed, accurate response."
              aria-label="Agent prompt"
              aria-required="true"
              aria-invalid={!!errors.prompt}
              className={`w-full resize-none bg-transparent px-4 py-4 font-mono text-sm leading-relaxed text-white placeholder-[#4B5563] focus:outline-none min-h-[240px] ${
                showPreview ? "border-r border-[#2A3A4E]" : ""
              }`}
              style={{ caretColor: "#00D9FF" }}
            />
          </div>

          {/* Live Preview */}
          {showPreview && (
            <div className="min-h-[240px] p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-medium text-[#6B7280]">PREVIEW</span>
                {previewStatus === "loading" && (
                  <svg className="h-3 w-3 animate-spin text-[#2563EB]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {previewStatus === "success" && (
                  <span className="text-[10px] text-[#10B981]">✓ Live</span>
                )}
                {previewStatus === "error" && (
                  <span className="text-[10px] text-[#EF4444]">Error</span>
                )}
                {previewStatus === "timeout" && (
                  <span className="text-[10px] text-[#F59E0B]">Timeout (2s)</span>
                )}
              </div>

              {previewStatus === "idle" && (
                <p className="text-xs text-[#4B5563]">Preview will run automatically…</p>
              )}

              {previewStatus === "loading" && !previewOutput && (
                <p className="text-xs text-[#6B7280]">Running with Ollama…</p>
              )}

              {(previewStatus === "error" || previewStatus === "timeout") && (
                <div className="rounded-[6px] border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-3">
                  <p className="text-xs text-[#F59E0B]">
                    {previewStatus === "timeout"
                      ? "Preview timed out. Make sure Ollama is running: `ollama serve`"
                      : previewOutput || "Preview failed"}
                  </p>
                  <button
                    type="button"
                    onClick={runPreview}
                    className="mt-2 text-xs text-[#00D9FF] hover:underline"
                  >
                    Retry →
                  </button>
                </div>
              )}

              {previewOutput && previewStatus !== "error" && (
                <div className="prose prose-sm prose-invert max-w-none text-xs">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {previewOutput}
                  </ReactMarkdown>
                  {previewStatus === "loading" && (
                    <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-[#00D9FF]" aria-hidden="true" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {errors.prompt && (
        <p role="alert" className="text-xs text-[#EF4444]">{errors.prompt}</p>
      )}

      {/* Tips */}
      <div className="rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Tips</p>
        <ul className="space-y-1.5 text-xs text-[#6B7280]">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-[#00D9FF]">→</span>
            Use <code className="font-mono text-[#00D9FF]">{"{{input}}"}</code> where you want the user&apos;s main text to appear
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-[#00D9FF]">→</span>
            {"Be specific: \"Write a 500-word blog post about {{topic}} in a {{tone}} tone\""}
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-[#00D9FF]">→</span>
            Define the output format: &quot;Return a numbered list&quot;, &quot;Use markdown headers&quot;, etc.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-[#00D9FF]">→</span>
            Parameters defined in Step 3 become{" "}
            <code className="font-mono text-[#00D9FF]">{"{{parameter_name}}"}</code> placeholders
          </li>
        </ul>
      </div>
    </div>
  );
}
