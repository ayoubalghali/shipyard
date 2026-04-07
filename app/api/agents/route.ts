import { NextRequest, NextResponse } from "next/server";
import { MOCK_AGENTS } from "@/lib/mockData";
import { Agent } from "@/lib/types";

// In-memory store for newly created agents (persists across requests in dev,
// reset on server restart — full DB persistence comes with Prisma in Week 3+)
const createdAgents: Agent[] = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const category = searchParams.get("category")?.toLowerCase() ?? "";
  const sort = searchParams.get("sort") ?? "trending";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  let agents = [...createdAgents, ...MOCK_AGENTS];

  if (search) {
    agents = agents.filter(
      (a) =>
        a.name.toLowerCase().includes(search) ||
        a.description.toLowerCase().includes(search) ||
        a.category.toLowerCase().includes(search) ||
        a.tags.some((t) => t.toLowerCase().includes(search))
    );
  }

  if (category) {
    agents = agents.filter((a) => a.category.toLowerCase() === category);
  }

  switch (sort) {
    case "most_used":
    case "trending":
      agents.sort((a, b) => b.usageCount - a.usageCount);
      break;
    case "highest_rated":
      agents.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      agents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  const total = agents.length;
  const paginated = agents.slice(offset, offset + limit);

  return NextResponse.json({
    agents: paginated,
    total,
    hasMore: offset + limit < total,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      name?: string;
      description?: string;
      category?: string;
      tags?: string[];
      prompt?: string;
      parameters?: unknown;
      default_model?: string;
      temperature?: number;
      max_tokens?: number;
      system_prompt?: string;
      is_public?: boolean;
    };

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!body.description?.trim()) {
      return NextResponse.json({ error: "description is required" }, { status: 400 });
    }
    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const newAgent: Agent = {
      id: `agent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: body.name.trim(),
      description: body.description.trim(),
      category: body.category ?? "Workflows",
      tags: body.tags ?? [],
      rating: 0,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      creator: {
        id: "current_user",
        name: "You",
        avatar: "YO",
        isVerified: false,
      },
      prompt: body.prompt.trim(),
      parameters: (body.parameters as Agent["parameters"]) ?? [],
      defaultModel: (body.default_model as "claude" | "ollama") ?? "ollama",
      temperature: body.temperature ?? 0.7,
      maxTokens: body.max_tokens ?? 2000,
      isPublic: body.is_public ?? true,
      status: "published",
    };

    createdAgents.unshift(newAgent);

    return NextResponse.json(
      {
        agent: newAgent,
        message: "Agent created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/agents error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
