"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/layout/Header";
import StepIndicator from "@/components/builder/StepIndicator";
import Step1BasicInfo from "@/components/builder/Step1BasicInfo";
import Step2PromptEditor from "@/components/builder/Step2PromptEditor";
import Step3Parameters from "@/components/builder/Step3Parameters";
import Step4Settings from "@/components/builder/Step4Settings";
import { useBuilderStore, BuilderStep } from "@/store/builderStore";
import { AgentParameter } from "@/lib/types";

interface PageProps {
  params: { id: string };
}

interface AgentData {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  prompt: string;
  parameters: AgentParameter[];
  system_prompt: string | null;
  default_model: string;
  temperature: number;
  max_tokens: number;
  is_public: boolean;
  status: string;
  creator_id: string;
}

const STEP_COMPONENTS: Record<1 | 2 | 3 | 4, React.ComponentType> = {
  1: Step1BasicInfo,
  2: Step2PromptEditor,
  3: Step3Parameters,
  4: Step4Settings,
};


export default function EditAgentPage({ params }: PageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const builderStore = useBuilderStore();
  const { name, description, category, tags, prompt, parameters,
    defaultModel, temperature, maxTokens, systemPrompt, visibility } = builderStore;

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Fetch agent + verify ownership
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/agents/${params.id}`)
      .then((r) => r.json())
      .then((data: { agent?: AgentData; isOwner?: boolean; error?: string }) => {
        if (!data.isOwner || !data.agent) {
          router.push(`/agent/${params.id}`);
          return;
        }
        const a = data.agent;
        setAgent(a);
        // Pre-fill builder store in one batch
        useBuilderStore.setState({
          name: a.name,
          description: a.description,
          category: a.category,
          tags: a.tags ?? [],
          prompt: a.prompt ?? "",
          parameters: (a.parameters ?? []) as AgentParameter[],
          defaultModel: (a.default_model as "ollama" | "claude") ?? "ollama",
          temperature: a.temperature ?? 0.7,
          maxTokens: a.max_tokens ?? 2000,
          systemPrompt: a.system_prompt ?? "",
          visibility: a.is_public ? "public" : "private",
        });
      })
      .catch(() => router.push("/creator/dashboard"))
      .finally(() => setLoadingAgent(false));
  }, [status, params.id, router]);

  const completedSteps = useMemo(() => {
    const s = new Set<1 | 2 | 3 | 4>();
    for (let i = 1; i < step; i++) s.add(i as 1 | 2 | 3 | 4);
    return s;
  }, [step]);

  const handleSave = async (asDraft = false) => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`/api/agents/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          category,
          tags,
          prompt,
          parameters,
          system_prompt: systemPrompt || null,
          default_model: defaultModel,
          temperature,
          max_tokens: maxTokens,
          is_public: visibility === "public",
          status: asDraft ? "draft" : "published",
        }),
      });
      if (res.ok) {
        router.push(`/agent/${params.id}`);
      } else {
        const d = await res.json() as { error?: string };
        setSaveError(d.error ?? "Failed to save agent.");
      }
    } catch {
      setSaveError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loadingAgent) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!agent) return null;

  const StepComponent = STEP_COMPONENTS[step];
  const isLastStep = step === 4;
  const isFirstStep = step === 1;

  // Cast step to BuilderStep for the StepIndicator (which expects 1-5, we use 1-4)
  const stepAsBuilderStep = step as BuilderStep;

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => router.push(`/agent/${params.id}`)}
              className="text-[#6B7280] hover:text-white transition-colors text-sm"
            >
              ← Back to agent
            </button>
          </div>
          <h1 className="text-2xl font-semibold text-white">Edit Agent</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Editing <span className="text-[#A3A3A3]">{agent.name}</span>
          </p>
        </div>

        {/* Step indicator — reuses builder stepper (shows steps 1-4 only, step 5 = publish is replaced by inline buttons) */}
        <StepIndicator
          currentStep={stepAsBuilderStep}
          completedSteps={completedSteps as Set<BuilderStep>}
          onStepClick={(s) => { if ((s as number) <= 4) setStep(s as 1 | 2 | 3 | 4); }}
        />

        {/* Step content */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.15 }}
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {saveError && (
          <p className="mt-4 text-sm text-red-400">{saveError}</p>
        )}
        <div className="mt-8 flex items-center justify-between">
          <button
            disabled={isFirstStep}
            onClick={() => setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3 | 4)}
            className="px-4 py-2 border border-[#2A3A4E] rounded-md text-sm text-[#A3A3A3] hover:border-[#2563EB] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          <div className="flex gap-2">
            {isLastStep ? (
              <>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="px-4 py-2 border border-[#2A3A4E] rounded-md text-sm text-[#A3A3A3] hover:border-[#2563EB] transition-colors disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Update & Publish"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setStep((s) => Math.min(4, s + 1) as 1 | 2 | 3 | 4)}
                className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] rounded-md text-sm font-medium text-white transition-colors"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
