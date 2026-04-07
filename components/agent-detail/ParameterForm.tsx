"use client";

import { AgentParameter } from "@/lib/types";

interface ParameterFormProps {
  parameters: AgentParameter[];
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  disabled?: boolean;
}

export default function ParameterForm({
  parameters,
  values,
  errors,
  onChange,
  disabled = false,
}: ParameterFormProps) {
  if (parameters.length === 0) {
    return (
      <p className="text-sm text-[#6B7280]">
        This agent has no configurable parameters.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4" role="group" aria-label="Input parameters">
      {parameters.map((param) => {
        const id = `param-${param.name}`;
        const hasError = !!errors[param.name];

        return (
          <div key={param.name}>
            <label
              htmlFor={id}
              className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-white"
            >
              {param.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              {param.required && (
                <span className="text-[#EF4444]" aria-label="required">*</span>
              )}
            </label>

            {param.helpText && (
              <p className="mb-2 text-xs text-[#6B7280]">{param.helpText}</p>
            )}

            {param.type === "textarea" ? (
              <textarea
                id={id}
                name={param.name}
                value={values[param.name] ?? ""}
                onChange={(e) => onChange(param.name, e.target.value)}
                placeholder={param.defaultValue || `Enter ${param.name}...`}
                rows={5}
                disabled={disabled}
                aria-required={param.required}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${id}-error` : undefined}
                className={`w-full resize-y rounded-[6px] border bg-[#1A2332] px-3 py-2 text-sm text-white placeholder-[#6B7280] transition-all duration-150 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                  hasError
                    ? "border-[#EF4444] focus:border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                    : "border-[#2A3A4E] focus:border-[#00D9FF] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                }`}
              />
            ) : param.type === "select" && param.options ? (
              <div className="relative">
                <select
                  id={id}
                  name={param.name}
                  value={values[param.name] ?? param.defaultValue ?? ""}
                  onChange={(e) => onChange(param.name, e.target.value)}
                  disabled={disabled}
                  aria-required={param.required}
                  aria-invalid={hasError}
                  className={`w-full appearance-none rounded-[6px] border bg-[#1A2332] py-2 pl-3 pr-8 text-sm text-white transition-all focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
                    hasError
                      ? "border-[#EF4444] focus:border-[#EF4444]"
                      : "border-[#2A3A4E] focus:border-[#00D9FF] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                  }`}
                >
                  {param.options.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#0A0E27]">
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B7280]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            ) : param.type === "number" ? (
              <input
                type="number"
                id={id}
                name={param.name}
                value={values[param.name] ?? ""}
                onChange={(e) => onChange(param.name, e.target.value)}
                placeholder={param.defaultValue || "0"}
                disabled={disabled}
                aria-required={param.required}
                aria-invalid={hasError}
                className={`w-full rounded-[6px] border bg-[#1A2332] px-3 py-2 text-sm text-white placeholder-[#6B7280] transition-all focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                  hasError
                    ? "border-[#EF4444] focus:border-[#EF4444]"
                    : "border-[#2A3A4E] focus:border-[#00D9FF] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                }`}
              />
            ) : (
              <input
                type="text"
                id={id}
                name={param.name}
                value={values[param.name] ?? ""}
                onChange={(e) => onChange(param.name, e.target.value)}
                placeholder={param.defaultValue || `Enter ${param.name}...`}
                disabled={disabled}
                aria-required={param.required}
                aria-invalid={hasError}
                className={`w-full rounded-[6px] border bg-[#1A2332] px-3 py-2 text-sm text-white placeholder-[#6B7280] transition-all focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                  hasError
                    ? "border-[#EF4444] focus:border-[#EF4444]"
                    : "border-[#2A3A4E] focus:border-[#00D9FF] focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)]"
                }`}
              />
            )}

            {hasError && (
              <p
                id={`${id}-error`}
                role="alert"
                className="mt-1 text-xs text-[#EF4444]"
              >
                {errors[param.name]}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
