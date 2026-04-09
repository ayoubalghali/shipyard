import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, DB_AVAILABLE } from "@/lib/db";
import { MOCK_AGENTS } from "@/lib/mockData";
import { Agent } from "@/lib/types";

// In-memory fallback store for environments without a DB
const memAgents: Agent[] = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const category = searchParams.get("category")?.toLowerCase() ?? "";
  const sort = searchParams.get("sort") ?? "trending";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  // ── Prisma path ────────────────────────────────────────────────────────────
  if (DB_AVAILABLE) {
    try {
      const where = {
        status: "published",
        is_public: true,
        ...(category ? { category: { equals: category, mode: "insensitive" as const } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { description: { contains: search, mode: "insensitive" as const } },
                { tags: { has: search } },
              ],
            }
          : {}),
      };

      const orderBy =
        sort === "highest_rated"
          ? { rating: "desc" as const }
          : sort === "newest"
          ? { created_at: "desc" as const }
          : { usage_count: "desc" as const };

      const [total, agents] = await Promise.all([
        db.agent.count({ where }),
        db.agent.findMany({
          where,
          orderBy,
          skip: offset,
          take: limit,
          include: { creator: { select: { id: true, name: true, avatar_url: true, is_verified: true } } },
        }),
      ]);

      const response = NextResponse.json({ agents, total, hasMore: offset + limit < total });
      response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
      return response;
    } catch (err) {
      console.error("GET /api/agents DB error:", err);
      // Fall through to mock
    }
  }

  // ── Mock fallback ──────────────────────────────────────────────────────────
  let agents = [...memAgents, ...MOCK_AGENTS];

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
  const response = NextResponse.json({ agents: agents.slice(offset, offset + limit), total, hasMore: offset + limit < total });
  response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  return response;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

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

    if (!body.name?.trim())        return NextResponse.json({ error: "name is required" }, { status: 400 });
    if (!body.description?.trim()) return NextResponse.json({ error: "description is required" }, { status: 400 });
    if (!body.prompt?.trim())      return NextResponse.json({ error: "prompt is required" }, { status: 400 });

    // ── Prisma path ──────────────────────────────────────────────────────────
    if (DB_AVAILABLE && session?.user?.email) {
      const user = await db.user.findUnique({ where: { email: session.user.email } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });

      const agent = await db.agent.create({
        data: {
          name: body.name.trim(),
          description: body.description.trim(),
          category: body.category ?? "Workflows",
          tags: body.tags ?? [],
          prompt: body.prompt.trim(),
          parameters: (body.parameters ?? []) as object,
          system_prompt: body.system_prompt,
          default_model: body.default_model ?? "ollama",
          temperature: body.temperature ?? 0.7,
          max_tokens: body.max_tokens ?? 2000,
          is_public: body.is_public ?? true,
          status: "published",
          creator_id: user.id,
        },
        include: { creator: { select: { id: true, name: true, avatar_url: true, is_verified: true } } },
      });

      return NextResponse.json({ agent, message: "Agent created successfully" }, { status: 201 });
    }

    // ── Mock fallback ────────────────────────────────────────────────────────
    const newAgent: Agent = {
      id: `agent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: body.name.trim(),
      description: body.description.trim(),
      category: body.category ?? "Workflows",
      tags: body.tags ?? [],
      rating: 0,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      creator: { id: "current_user", name: "You", avatar: "YO", isVerified: false },
      prompt: body.prompt.trim(),
      parameters: (body.parameters as Agent["parameters"]) ?? [],
      defaultModel: (body.default_model as "claude" | "ollama") ?? "ollama",
      temperature: body.temperature ?? 0.7,
      maxTokens: body.max_tokens ?? 2000,
      isPublic: body.is_public ?? true,
      status: "published",
    };

    memAgents.unshift(newAgent);
    return NextResponse.json({ agent: newAgent, message: "Agent created successfully" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/agents error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
