"use client";

type ModelType = "ollama" | "claude";

interface ModelSelectorProps {
  value: ModelType;
  onChange: (model: ModelType) => void;
  disabled?: boolean;
}

const MODELS: { value: ModelType; label: string; description: string; badge: string }[] = [
  {
    value: "ollama",
    label: "Ollama (Local)",
    description: "Runs on your machine — free, private, no API key needed",
    badge: "Free",
  },
  {
    value: "claude",
    label: "Claude AI",
    description: "Anthropic's Claude — higher quality, requires API key",
    badge: "Paid",
  },
];

export default function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  return (
    <div role="radiogroup" aria-label="Select AI model">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
        Model
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        {MODELS.map((model) => {
          const isSelected = value === model.value;
          return (
            <label
              key={model.value}
              className={`flex flex-1 cursor-pointer items-start gap-3 rounded-[8px] border p-3 transition-all duration-150 ${
                isSelected
                  ? "border-[#2563EB] bg-[#0A0E27]"
                  : "border-[#2A3A4E] bg-[#0A0E27] hover:border-[#2563EB]/50"
              } ${disabled ? "pointer-events-none opacity-50" : ""}`}
            >
              <input
                type="radio"
                name="model"
                value={model.value}
                checked={isSelected}
                onChange={() => onChange(model.value)}
                disabled={disabled}
                className="mt-0.5 h-4 w-4 accent-[#2563EB]"
                aria-label={model.label}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-[#A3A3A3]"}`}>
                    {model.label}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      model.value === "ollama"
                        ? "bg-[#10B981]/10 text-[#10B981]"
                        : "bg-[#2563EB]/10 text-[#2563EB]"
                    }`}
                  >
                    {model.badge}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-[#6B7280]">{model.description}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
