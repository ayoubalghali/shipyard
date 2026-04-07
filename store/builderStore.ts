import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AgentParameter } from "@/lib/types";

export type BuilderStep = 1 | 2 | 3 | 4 | 5;
export type Visibility = "public" | "private";
export type ModelType = "ollama" | "claude";

export interface BuilderState {
  // Navigation
  currentStep: BuilderStep;

  // Step 1 — Basic Info
  name: string;
  description: string;
  category: string;
  tags: string[];

  // Step 2 — Prompt Editor
  prompt: string;

  // Step 3 — Parameters
  parameters: AgentParameter[];

  // Step 4 — Settings
  defaultModel: ModelType;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  visibility: Visibility;

  // Validation errors per step
  errors: Record<string, string>;

  // Actions — navigation
  goToStep: (step: BuilderStep) => void;
  goNext: () => void;
  goBack: () => void;

  // Actions — field updates
  setName: (v: string) => void;
  setDescription: (v: string) => void;
  setCategory: (v: string) => void;
  setTags: (v: string[]) => void;
  setPrompt: (v: string) => void;
  addParameter: () => void;
  updateParameter: (index: number, field: keyof AgentParameter, value: string | boolean) => void;
  removeParameter: (index: number) => void;
  moveParameter: (from: number, to: number) => void;
  setDefaultModel: (v: ModelType) => void;
  setTemperature: (v: number) => void;
  setMaxTokens: (v: number) => void;
  setSystemPrompt: (v: string) => void;
  setVisibility: (v: Visibility) => void;

  // Validation
  validateStep: (step: BuilderStep) => boolean;
  clearErrors: () => void;

  // Reset
  reset: () => void;
}

const DEFAULT_STATE = {
  currentStep: 1 as BuilderStep,
  name: "",
  description: "",
  category: "Workflows",
  tags: [] as string[],
  prompt: "You are a helpful AI assistant.\n\nUser input: {{input}}\n\nProvide a detailed, accurate response.",
  parameters: [
    {
      name: "input",
      type: "textarea" as const,
      required: true,
      defaultValue: "",
      helpText: "Describe what you need help with",
    },
  ] as AgentParameter[],
  defaultModel: "ollama" as ModelType,
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: "",
  visibility: "public" as Visibility,
  errors: {} as Record<string, string>,
};

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      goToStep: (step) => set({ currentStep: step, errors: {} }),

      goNext: () => {
        const { currentStep, validateStep } = get();
        if (!validateStep(currentStep)) return;
        if (currentStep < 5) {
          set({ currentStep: (currentStep + 1) as BuilderStep, errors: {} });
        }
      },

      goBack: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: (currentStep - 1) as BuilderStep, errors: {} });
        }
      },

      setName: (v) => set({ name: v }),
      setDescription: (v) => set({ description: v }),
      setCategory: (v) => set({ category: v }),
      setTags: (v) => set({ tags: v }),
      setPrompt: (v) => set({ prompt: v }),
      setDefaultModel: (v) => set({ defaultModel: v }),
      setTemperature: (v) => set({ temperature: v }),
      setMaxTokens: (v) => set({ maxTokens: v }),
      setSystemPrompt: (v) => set({ systemPrompt: v }),
      setVisibility: (v) => set({ visibility: v }),

      addParameter: () => {
        const { parameters } = get();
        const newParam: AgentParameter = {
          name: `param_${parameters.length + 1}`,
          type: "text",
          required: false,
          defaultValue: "",
          helpText: "",
        };
        set({ parameters: [...parameters, newParam] });
      },

      updateParameter: (index, field, value) => {
        const params = [...get().parameters];
        params[index] = { ...params[index], [field]: value };
        set({ parameters: params });
      },

      removeParameter: (index) => {
        const params = get().parameters.filter((_, i) => i !== index);
        set({ parameters: params });
      },

      moveParameter: (from, to) => {
        const params = [...get().parameters];
        const [moved] = params.splice(from, 1);
        params.splice(to, 0, moved);
        set({ parameters: params });
      },

      validateStep: (step) => {
        const state = get();
        const errors: Record<string, string> = {};

        if (step === 1) {
          if (!state.name.trim()) errors.name = "Agent name is required";
          else if (state.name.trim().length < 3) errors.name = "Name must be at least 3 characters";
          else if (state.name.trim().length > 60) errors.name = "Name must be 60 characters or less";
          if (!state.description.trim()) errors.description = "Description is required";
          else if (state.description.trim().length < 20) errors.description = "Description must be at least 20 characters";
          else if (state.description.trim().length > 500) errors.description = "Description must be 500 characters or less";
          if (!state.category) errors.category = "Please select a category";
        }

        if (step === 2) {
          if (!state.prompt.trim()) errors.prompt = "Prompt is required";
          else if (state.prompt.trim().length < 10) errors.prompt = "Prompt must be at least 10 characters";
        }

        if (step === 3) {
          const names = state.parameters.map((p) => p.name.trim());
          names.forEach((name, i) => {
            if (!name) errors[`param_name_${i}`] = "Parameter name is required";
            else if (!/^[a-z_][a-z0-9_]*$/.test(name))
              errors[`param_name_${i}`] = "Use lowercase letters, numbers, underscores only";
            else if (names.indexOf(name) !== i)
              errors[`param_name_${i}`] = "Parameter names must be unique";
          });
        }

        if (step === 4) {
          if (state.maxTokens < 100 || state.maxTokens > 4000)
            errors.maxTokens = "Max tokens must be between 100 and 4000";
        }

        set({ errors });
        return Object.keys(errors).length === 0;
      },

      clearErrors: () => set({ errors: {} }),

      reset: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: "shipyard-builder-draft",
      // Only persist the content fields, not navigation/errors
      partialize: (state) => ({
        name: state.name,
        description: state.description,
        category: state.category,
        tags: state.tags,
        prompt: state.prompt,
        parameters: state.parameters,
        defaultModel: state.defaultModel,
        temperature: state.temperature,
        maxTokens: state.maxTokens,
        systemPrompt: state.systemPrompt,
        visibility: state.visibility,
      }),
    }
  )
);
