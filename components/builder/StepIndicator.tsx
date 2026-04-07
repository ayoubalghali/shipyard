"use client";

import { BuilderStep } from "@/store/builderStore";

const STEPS: { step: BuilderStep; label: string; icon: string }[] = [
  { step: 1, label: "Basic Info", icon: "📝" },
  { step: 2, label: "Prompt", icon: "✍️" },
  { step: 3, label: "Parameters", icon: "🔧" },
  { step: 4, label: "Settings", icon: "⚙️" },
  { step: 5, label: "Review", icon: "🚀" },
];

interface StepIndicatorProps {
  currentStep: BuilderStep;
  onStepClick: (step: BuilderStep) => void;
  completedSteps: Set<BuilderStep>;
}

export default function StepIndicator({ currentStep, onStepClick, completedSteps }: StepIndicatorProps) {
  return (
    <nav aria-label="Builder progress" className="mb-8">
      {/* Desktop: horizontal stepper */}
      <ol className="hidden items-center sm:flex">
        {STEPS.map(({ step, label }, index) => {
          const isActive = currentStep === step;
          const isCompleted = completedSteps.has(step);
          const isClickable = isCompleted || step < currentStep;

          return (
            <li key={step} className="flex flex-1 items-center">
              <button
                onClick={() => isClickable && onStepClick(step)}
                disabled={!isClickable}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${step}: ${label}${isCompleted ? " (completed)" : ""}`}
                className={`flex flex-col items-center gap-1.5 transition-all duration-150 disabled:cursor-default ${
                  isClickable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {/* Circle */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-[#2563EB] text-white ring-2 ring-[#2563EB] ring-offset-2 ring-offset-black"
                      : isCompleted
                      ? "bg-[#10B981] text-white"
                      : "border border-[#2A3A4E] bg-[#0A0E27] text-[#6B7280]"
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {/* Label */}
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isActive ? "text-white" : isCompleted ? "text-[#10B981]" : "text-[#6B7280]"
                  }`}
                >
                  {label}
                </span>
              </button>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-px flex-1 transition-colors duration-150 ${
                    completedSteps.has(step) ? "bg-[#10B981]" : "bg-[#2A3A4E]"
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: compact progress bar */}
      <div className="sm:hidden">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-white">
            Step {currentStep} of 5 — {STEPS[currentStep - 1].label}
          </span>
          <span className="text-xs text-[#6B7280]">{Math.round(((currentStep - 1) / 4) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1A2332]" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={5}>
          <div
            className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          />
        </div>
        {/* Mini step pills */}
        <div className="mt-3 flex gap-1.5">
          {STEPS.map(({ step }) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full transition-colors duration-150 ${
                step < currentStep
                  ? "bg-[#10B981]"
                  : step === currentStep
                  ? "bg-[#2563EB]"
                  : "bg-[#2A3A4E]"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
