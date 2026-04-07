import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AgentDetailClient from "@/app/agent/[id]/AgentDetailClient";
import { MOCK_AGENTS } from "@/lib/mockData";
import { prisma, DB_AVAILABLE } from "@/lib/db";
import { Agent, AgentParameter } from "@/lib/types";

interface AgentPageProps {
  params: { id: string };
}

type DbAgent = {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  model: string;
  usage_count: number;
  rating: number;
  creator_id: string | null;
  prompt_template: string | null;
  tags: string[];
  price?: number | null;
};

type DbUser = {
  id: string;
  name: string;
  avatar_url: string | null;
};

// Fetch all published agent IDs for static generation
async function getAllAgentIds(): Promise<string[]> {
  if (DB_AVAILABLE) {
    try {
      const agents = await prisma.agent.findMany({
        where: { status: "published" },
        select: { id: true },
      }) as { id: string }[];
      if (agents.length > 0) return agents.map((a) => a.id);
    } catch {
      // Fall through to mock
    }
  }
  return MOCK_AGENTS.map((a) => a.id);
}

// Fetch a single agent by id
async function getAgentById(id: string): Promise<DbAgent | null> {
  if (DB_AVAILABLE) {
    try {
      const agent = await prisma.agent.findUnique({
        where: { id },
      }) as DbAgent | null;
      if (agent) return agent;
    } catch {
      // Fall through to mock
    }
  }
  const mock = MOCK_AGENTS.find((a) => a.id === id);
  if (!mock) return null;
  return {
    id: mock.id,
    name: mock.name,
    description: mock.description,
    category: mock.category,
    status: mock.status ?? "published",
    model: "ollama",
    usage_count: mock.usageCount ?? 0,
    rating: mock.rating ?? 4.5,
    creator_id: null,
    prompt_template: null,
    tags: mock.tags ?? [],
    price: 0,
  };
}

// Generate static params for all known agents
export async function generateStaticParams() {
  const ids = await getAllAgentIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: AgentPageProps): Promise<Metadata> {
  const agent = await getAgentById(params.id);
  if (!agent) return { title: "Agent not found — Shipyard" };
  return {
    title: `${agent.name} — Shipyard`,
    description: agent.description,
  };
}

// Enrich a DB agent row with UI-required fields for the detail page
function enrichDbAgent(agent: DbAgent, creator?: DbUser | null): Agent & { parameters: AgentParameter[] } {
  const creatorName = creator?.name ?? "Unknown Creator";
  const creatorAvatar = creator?.avatar_url ?? creatorName.slice(0, 2).toUpperCase();

  return {
    id: agent.id,
    name: agent.name,
    description: agent.description,
    category: agent.category,
    status: agent.status as "draft" | "published" | "archived",
    usageCount: agent.usage_count,
    rating: agent.rating,
    tags: agent.tags ?? [],
    createdAt: new Date().toISOString().slice(0, 10),
    creator: {
      id: creator?.id ?? "unknown",
      name: creatorName,
      avatar: creatorAvatar,
      isVerified: false,
    },
    prompt: agent.prompt_template ?? `You are a helpful AI assistant specializing in ${agent.name}.\n\nUser input: {{input}}`,
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
    defaultModel: (agent.model as "ollama" | "claude") ?? "ollama",
    temperature: 0.7,
    maxTokens: 2000,
  };
}

export default async function AgentDetailPage({ params }: AgentPageProps) {
  const dbAgent = await getAgentById(params.id);
  if (!dbAgent) notFound();

  // Fetch creator info if we have a creator_id
  let creator: DbUser | null = null;
  if (dbAgent.creator_id && DB_AVAILABLE) {
    try {
      creator = await prisma.user.findUnique({
        where: { id: dbAgent.creator_id },
        select: { id: true, name: true, avatar_url: true },
      }) as DbUser | null;
    } catch {
      // Non-fatal
    }
  }

  // Fetch related agents in same category
  let related: Agent[] = [];
  if (DB_AVAILABLE) {
    try {
      const relatedDb = await prisma.agent.findMany({
        where: { category: dbAgent.category, id: { not: dbAgent.id }, status: "published" },
        take: 4,
      }) as DbAgent[];
      if (relatedDb.length > 0) {
        related = relatedDb.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          category: r.category,
          status: r.status as "draft" | "published" | "archived",
          usageCount: r.usage_count,
          rating: r.rating,
          tags: r.tags ?? [],
          createdAt: new Date().toISOString().slice(0, 10),
          creator: {
            id: "unknown",
            name: "Creator",
            avatar: r.id.slice(0, 2).toUpperCase(),
            isVerified: false,
          },
        }));
      }
    } catch {
      // Fall through to mock fallback
    }
  }

  if (related.length === 0) {
    related = MOCK_AGENTS.filter(
      (a) => a.category === dbAgent.category && a.id !== dbAgent.id
    ).slice(0, 4);
  }

  const agent = enrichDbAgent(dbAgent, creator);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <AgentDetailClient agent={agent} creator={agent.creator} related={related} />
      <Footer />
    </div>
  );
}
