"use client";

import { useBuilderStore } from "@/store/builderStore";
import { AgentParameter } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

const PARAM_TYPES: { value: AgentParameter["type"]; label: string; description: string }[] = [
  { value: "text", label: "Short Text", description: "Single line input" },
  { value: "textarea", label: "Long Text", description: "Multi-line textarea" },
  { value: "number", label: "Number", description: "Numeric input" },
  { value: "select", label: "Dropdown", description: "List of options" },
  { value: "file", label: "File", description: "File upload (coming soon)" },
];

interface ParameterRowProps {
  param: AgentParameter;
  index: number;
  total: number;
  errors: Record<string, string>;
}

function ParameterRow({ param, index, total, errors }: ParameterRowProps) {
  const { updateParameter, removeParameter, moveParameter } = useBuilderStore();
  const nameError = errors[`param_name_${index}`];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] p-4"
    >
      {/* Row header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Reorder buttons */}
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => index > 0 && moveParameter(index, index - 1)}
              disabled={index === 0}
              aria-label="Move parameter up"
              className="flex h-5 w-5 items-center justify-center rounded text-[#6B7280] transition-colors hover:text-white disabled:opacity-30"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => index < total - 1 && moveParameter(index, index + 1)}
              disabled={index === total - 1}
              aria-label="Move parameter down"
              className="flex h-5 w-5 items-center justify-center rounded text-[#6B7280] transition-colors hover:text-white disabled:opacity-30"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <span className="text-sm font-medium text-[#A3A3A3]">
            Parameter {index + 1}
          </span>
          {param.required && (
            <span className="rounded-full border border-[#2563EB]/30 bg-[#2563EB]/10 px-2 py-0.5 text-[10px] font-medium text-[#2563EB]">
              Required
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => removeParameter(index)}
          aria-label={`Remove parameter ${param.name}`}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B7280] transition-colors hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Parameter Name */}
        <div>
          <label htmlFor={`param-name-${index}`} className="mb-1.5 block text-xs font-medium text-[#A3A3A3]">
            Parameter Name <span className="text-[#EF4444]">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#6B7280]">
              {"{{"}
            </span>
            <input
              id={`param-name-${index}`}
              type="text"
              value={param.name}
              onChange={(e) => updateParameter(index, "name", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
              placeholder="input"
              aria-invalid={!!nameError}
              className={`w-full rounded-[6px] border bg-[#1A2332] py-2 pl-8 pr-8 font-mono text-sm text-white placeholder-[#4B5563] transition-all focus:outline-none ${
                nameError
                  ? "border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                  : "border-[#2A3A4E] focus:border-[#00D9FF] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
              }`}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#6B7280]">
              {"}}"}
            </span>
          </div>
          {nameError && (
            <p role="alert" className="mt-1 text-xs text-[#EF4444]">{nameError}</p>
          )}
        </div>

        {/* Type */}
        <div>
          <label htmlFor={`param-type-${index}`} className="mb-1.5 block text-xs font-medium text-[#A3A3A3]">
            Type
          </label>
          <div className="relative">
            <select
              id={`param-type-${index}`}
              value={param.type}
              onChange={(e) => updateParameter(index, "type", e.target.value)}
              className="w-full appearance-none rounded-[6px] border border-[#2A3A4E] bg-[#1A2332] py-2 pl-3 pr-8 text-sm text-white transition-all focus:border-[#00D9FF] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] cursor-pointer"
            >
              {PARAM_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-[#0A0E27]" disabled={t.value === "file"}>
                  {t.label}{t.value === "file" ? " (soon)" : ""}
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Help Text */}
        <div>
          <label htmlFor={`param-help-${index}`} className="mb-1.5 block text-xs font-medium text-[#A3A3A3]">
            Help Text <span className="text-[#6B7280]">(shown to users)</span>
          </label>
          <input
            id={`param-help-${index}`}
            type="text"
            value={param.helpText ?? ""}
            onChange={(e) => updateParameter(index, "helpText", e.target.value)}
            placeholder="e.g. Describe what you need help with"
            className="w-full rounded-[6px] border border-[#2A3A4E] bg-[#1A2332] px-3 py-2 text-sm text-white placeholder-[#4B5563] transition-all focus:border-[#00D9FF] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
          />
        </div>

        {/* Default Value */}
        <div>
          <label htmlFor={`param-default-${index}`} className="mb-1.5 block text-xs font-medium text-[#A3A3A3]">
            Default Value <span className="text-[#6B7280]">(optional)</span>
          </label>
          <input
            id={`param-default-${index}`}
            type="text"
            value={param.defaultValue ?? ""}
            onChange={(e) => updateParameter(index, "defaultValue", e.target.value)}
            placeholder="Pre-filled value..."
            className="w-full rounded-[6px] border border-[#2A3A4E] bg-[#1A2332] px-3 py-2 text-sm text-white placeholder-[#4B5563] transition-all focus:border-[#00D9FF] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
          />
        </div>

        {/* Select options (only for select type) */}
        {param.type === "select" && (
          <div className="sm:col-span-2">
            <label htmlFor={`param-options-${index}`} className="mb-1.5 block text-xs font-medium text-[#A3A3A3]">
              Options <span className="text-[#EF4444]">*</span>{" "}
              <span className="text-[#6B7280]">(comma-separated)</span>
            </label>
            <input
              id={`param-options-${index}`}
              type="text"
              value={(param.options ?? []).join(", ")}
              onChange={(e) =>
                updateParameter(
                  index,
                  "options",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean) as unknown as string
                )
              }
              placeholder="option1, option2, option3"
              className="w-full rounded-[6px] border border-[#2A3A4E] bg-[#1A2332] px-3 py-2 text-sm text-white placeholder-[#4B5563] transition-all focus:border-[#00D9FF] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
            />
          </div>
        )}
      </div>

      {/* Required toggle */}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={param.required}
          onClick={() => updateParameter(index, "required", !param.required)}
          aria-label={`${param.name} is ${param.required ? "required" : "optional"}`}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF] ${
            param.required ? "bg-[#2563EB]" : "bg-[#2A3A4E]"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-150 ${
              param.required ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-xs text-[#A3A3A3]">
          {param.required ? "Required field" : "Optional field"}
        </span>
      </div>
    </motion.div>
  );
}

export default function Step3Parameters() {
  const { parameters, addParameter, errors } = useBuilderStore();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[24px] font-semibold leading-[1.3] text-white">Input Parameters</h2>
        <p className="mt-1 text-sm text-[#A3A3A3]">
          Define what inputs users provide when running your agent. Each parameter becomes a{" "}
          <code className="rounded-[3px] bg-[#1A2332] px-1.5 py-0.5 font-mono text-xs text-[#00D9FF]">
            {"{{name}}"}
          </code>{" "}
          placeholder in your prompt.
        </p>
      </div>

      {/* Parameter list */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {parameters.map((param, index) => (
            <ParameterRow
              key={`${index}-${param.name}`}
              param={param}
              index={index}
              total={parameters.length}
              errors={errors}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={addParameter}
        disabled={parameters.length >= 10}
        className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-dashed border-[#2A3A4E] py-3 text-sm text-[#6B7280] transition-all hover:border-[#2563EB] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Add new parameter"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Parameter
        {parameters.length >= 10 && (
          <span className="text-xs text-[#4B5563]">(max 10)</span>
        )}
      </button>

      {/* Preview of the form */}
      {parameters.length > 0 && (
        <div className="rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
            Form Preview
          </p>
          <div className="flex flex-col gap-3">
            {parameters.map((param, i) => (
              <div key={i}>
                <label className="mb-1 block text-sm font-medium text-white">
                  {param.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  {param.required && <span className="ml-1 text-[#EF4444]">*</span>}
                </label>
                {param.helpText && (
                  <p className="mb-1 text-xs text-[#6B7280]">{param.helpText}</p>
                )}
                {param.type === "textarea" ? (
                  <div className="h-16 w-full rounded-[6px] border border-[#2A3A4E] bg-[#1A2332]" aria-hidden="true" />
                ) : param.type === "select" ? (
                  <div className="flex h-9 w-full items-center justify-between rounded-[6px] border border-[#2A3A4E] bg-[#1A2332] px-3">
                    <span className="text-xs text-[#4B5563]">
                      {param.options?.[0] ?? "Select option..."}
                    </span>
                    <svg className="h-3.5 w-3.5 text-[#4B5563]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                ) : (
                  <div className="h-9 w-full rounded-[6px] border border-[#2A3A4E] bg-[#1A2332]" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
