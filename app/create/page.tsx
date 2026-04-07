"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/layout/Header";
import StepIndicator from "@/components/builder/StepIndicator";
import Step1BasicInfo from "@/components/builder/Step1BasicInfo";
import Step2PromptEditor from "@/components/builder/Step2PromptEditor";
import Step3Parameters from "@/components/builder/Step3Parameters";
import Step4Settings from "@/components/builder/Step4Settings";
import Step5Review from "@/components/builder/Step5Review";
import { useBuilderStore, BuilderStep } from "@/store/builderStore";

const STEP_COMPONENTS: Record<BuilderStep, React.ComponentType> = {
  1: Step1BasicInfo,
  2: Step2PromptEditor,
  3: Step3Parameters,
  4: Step4Settings,
  5: Step5Review,
};

const STEP_LABELS: Record<BuilderStep, string> = {
  1: "Basic Info",
  2: "Prompt",
  3: "Parameters",
  4: "Settings",
  5: "Review & Publish",
};

export default function CreatePage() {
  const { currentStep, goNext, goBack, goToStep, validateStep } = useBuilderStore();

  // Track which steps the user has already passed through so they can jump back
  const completedSteps = useMemo(() => {
    const s = new Set<BuilderStep>();
    for (let i = 1; i < currentStep; i++) s.add(i as BuilderStep);
    return s;
  }, [currentStep]);

  const StepComponent = STEP_COMPONENTS[currentStep];
  const isLastStep = currentStep === 5;
  const isFirstStep = currentStep === 1;

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-[32px] font-semibold leading-[1.2] text-white">
            Create Agent
          </h1>
          <p className="mt-1 text-sm text-[#A3A3A3]">
            Build a powerful AI agent in minutes — no coding required.
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator
          currentStep={currentStep}
          onStepClick={goToStep}
          completedSteps={completedSteps}
        />

        {/* Step content with slide animation */}
        <div className="relative overflow-hidden rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons (hidden on Step 5 — it has its own CTAs) */}
        {!isLastStep && (
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={isFirstStep}
              className="flex items-center gap-2 rounded-[6px] border border-[#2A3A4E] px-5 py-2.5 text-sm font-medium text-[#A3A3A3] transition-all hover:border-[#2563EB] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {/* Step label */}
            <span className="text-xs text-[#4B5563]">
              Step {currentStep} — {STEP_LABELS[currentStep]}
            </span>

            <button
              type="button"
              onClick={() => {
                if (validateStep(currentStep)) goNext();
              }}
              className="flex items-center gap-2 rounded-[6px] bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#1D4ED8] active:bg-[#1E40AF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]"
            >
              Continue
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Draft indicator */}
        <p className="mt-4 text-center text-xs text-[#4B5563]">
          <svg className="mr-1 inline h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Draft saved automatically
        </p>
      </main>
    </div>
  );
}
