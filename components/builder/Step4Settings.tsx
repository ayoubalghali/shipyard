"use client";

import { useBuilderStore, Visibility } from "@/store/builderStore";

export default function Step4Settings() {
  const {
    defaultModel, temperature, maxTokens, systemPrompt, visibility, errors,
    setDefaultModel, setTemperature, setMaxTokens, setSystemPrompt, setVisibility,
  } = useBuilderStore();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[24px] font-semibold leading-[1.3] text-white">Agent Settings</h2>
        <p className="mt-1 text-sm text-[#A3A3A3]">
          Configure the AI model and execution defaults. Users can override these when running.
        </p>
      </div>

      {/* Model Selection */}
      <div>
        <p className="mb-3 text-sm font-medium text-white">Default Model</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(["ollama", "claude"] as const).map((model) => {
            const isSelected = defaultModel === model;
            return (
              <label
                key={model}
                className={`flex cursor-pointer items-start gap-3 rounded-[8px] border p-4 transition-all duration-150 ${
                  isSelected ? "border-[#2563EB] bg-[#0A0E27]" : "border-[#2A3A4E] bg-[#0A0E27] hover:border-[#2563EB]/50"
                }`}
              >
                <input
                  type="radio"
                  name="default-model"
                  value={model}
                  checked={isSelected}
                  onChange={() => setDefaultModel(model)}
                  className="mt-0.5 accent-[#2563EB]"
                  aria-label={model === "ollama" ? "Ollama (Local)" : "Claude AI"}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {model === "ollama" ? "Ollama (Local)" : "Claude AI"}
                    </span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        model === "ollama"
                          ? "bg-[#10B981]/10 text-[#10B981]"
                          : "bg-[#2563EB]/10 text-[#2563EB]"
                      }`}
                    >
                      {model === "ollama" ? "Free" : "Paid"}
                    </span>
                    {model === "ollama" && (
                      <span className="rounded-full bg-[#F59E0B]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#F59E0B]">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    {model === "ollama"
                      ? "Runs locally — private, free, no API key required"
                      : "Anthropic's Claude — highest quality, requires API key"}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Temperature */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="temperature" className="text-sm font-medium text-white">
            Temperature
          </label>
          <span className="rounded-[4px] bg-[#1A2332] px-2 py-0.5 font-mono text-xs text-[#00D9FF]">
            {temperature.toFixed(1)}
          </span>
        </div>
        <p className="mb-3 text-xs text-[#6B7280]">
          Controls randomness. Lower = more predictable. Higher = more creative.
        </p>
        <input
          type="range"
          id="temperature"
          min="0"
          max="1"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={temperature}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#2A3A4E] accent-[#2563EB]"
        />
        <div className="mt-1 flex justify-between text-[10px] text-[#4B5563]">
          <span>Precise (0.0)</span>
          <span>Balanced (0.7)</span>
          <span>Creative (1.0)</span>
        </div>
      </div>

      {/* Max Tokens */}
      <div>
        <label htmlFor="max-tokens" className="mb-1.5 block text-sm font-medium text-white">
          Max Output Tokens
        </label>
        <p className="mb-2 text-xs text-[#6B7280]">
          Maximum response length. 1 token ≈ 4 characters. Range: 100–4000.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            id="max-tokens"
            min={100}
            max={4000}
            step={100}
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
            aria-invalid={!!errors.maxTokens}
            className={`w-32 rounded-[6px] border bg-[#1A2332] px-3 py-2 text-sm text-white transition-all focus:outline-none ${
              errors.maxTokens
                ? "border-[#EF4444]"
                : "border-[#2A3A4E] focus:border-[#00D9FF] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
            }`}
          />
          <div className="flex gap-2">
            {[500, 1000, 2000, 4000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setMaxTokens(v)}
                aria-pressed={maxTokens === v}
                className={`rounded-[4px] border px-2.5 py-1.5 text-xs transition-all ${
                  maxTokens === v
                    ? "border-[#2563EB] bg-[#0A0E27] text-[#00D9FF]"
                    : "border-[#2A3A4E] text-[#6B7280] hover:border-[#2563EB]/50 hover:text-white"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        {errors.maxTokens && (
          <p role="alert" className="mt-1.5 text-xs text-[#EF4444]">{errors.maxTokens}</p>
        )}
      </div>

      {/* System Prompt Override */}
      <div>
        <label htmlFor="system-prompt" className="mb-1.5 block text-sm font-medium text-white">
          System Prompt Override{" "}
          <span className="text-[#6B7280]">(optional)</span>
        </label>
        <p className="mb-2 text-xs text-[#6B7280]">
          An additional instruction given to the model before the main prompt.
          Leave empty to use the model&apos;s default behavior.
        </p>
        <textarea
          id="system-prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="e.g. Always respond in JSON format. Never use markdown. Be extremely concise."
          rows={3}
          className="w-full resize-y rounded-[6px] border border-[#2A3A4E] bg-[#1A2332] px-3 py-2 font-mono text-xs text-white placeholder-[#4B5563] transition-all focus:border-[#00D9FF] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
        />
      </div>

      {/* Visibility */}
      <div>
        <p className="mb-3 text-sm font-medium text-white">Visibility</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(["public", "private"] as Visibility[]).map((v) => {
            const isSelected = visibility === v;
            return (
              <label
                key={v}
                className={`flex cursor-pointer items-start gap-3 rounded-[8px] border p-4 transition-all duration-150 ${
                  isSelected ? "border-[#2563EB] bg-[#0A0E27]" : "border-[#2A3A4E] bg-[#0A0E27] hover:border-[#2563EB]/50"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={v}
                  checked={isSelected}
                  onChange={() => setVisibility(v)}
                  className="mt-0.5 accent-[#2563EB]"
                  aria-label={v === "public" ? "Public" : "Private"}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white capitalize">{v}</span>
                    {v === "public" && (
                      <span className="rounded-full bg-[#10B981]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#10B981]">
                        Listed on marketplace
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    {v === "public"
                      ? "Anyone can find and use your agent. You earn when they do."
                      : "Only you can access this agent. Good for personal tools."}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
