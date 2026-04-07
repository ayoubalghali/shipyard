import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AgentDetailClient from "@/app/agent/[id]/AgentDetailClient";
import { MOCK_AGENTS } from "@/lib/mockData";
import { Agent, AgentParameter } from "@/lib/types";

interface AgentPageProps {
  params: { id: string };
}

// Generate static params for all known agents (builds statically at deploy time)
export async function generateStaticParams() {
  return MOCK_AGENTS.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: AgentPageProps): Promise<Metadata> {
  const agent = MOCK_AGENTS.find((a) => a.id === params.id);
  if (!agent) return { title: "Agent not found — Shipyard" };
  return {
    title: `${agent.name} — Shipyard`,
    description: agent.description,
  };
}

// Enrich mock agent with parameters for the detail page
function enrichAgent(agent: (typeof MOCK_AGENTS)[0]): Agent & { parameters: AgentParameter[] } {
  return {
    ...agent,
    prompt: `You are a helpful AI assistant specializing in ${agent.name}.\n\nUser input: {{input}}`,
    parameters: [
      {
        name: "input",
        type: "textarea",
        required: true,
        defaultValue: "",
        helpText: "Describe what you need. The more detail, the better the output.",
      },
      {
        name: "tone",
        type: "select",
        required: false,
        defaultValue: "professional",
        helpText: "Writing tone for the response",
        options: ["professional", "casual", "technical", "friendly", "concise"],
      },
    ],
    defaultModel: "ollama",
    temperature: 0.7,
    maxTokens: 2000,
  };
}

export default function AgentDetailPage({ params }: AgentPageProps) {
  const baseAgent = MOCK_AGENTS.find((a) => a.id === params.id);
  if (!baseAgent) notFound();

  const agent = enrichAgent(baseAgent);
  const related = MOCK_AGENTS.filter(
    (a) => a.category === baseAgent.category && a.id !== baseAgent.id
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <AgentDetailClient agent={agent} creator={baseAgent.creator} related={related} />
      <Footer />
    </div>
  );
}
