import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, DB_AVAILABLE } from "@/lib/db";
import { MOCK_AGENTS } from "@/lib/mockData";

type RouteContext = { params: { id: string } };

// ── GET /api/agents/[id] ─────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (DB_AVAILABLE) {
      // Increment view count and fetch in parallel
      const [agent] = await Promise.all([
        db.agent.findUnique({
          where: { id: params.id },
          include: { creator: { select: { id: true, name: true, avatar_url: true, is_verified: true, bio: true } } },
        }),
        db.agent.update({ where: { id: params.id }, data: { view_count: { increment: 1 } } }).catch(() => null),
      ]);

      if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

      const related = await db.agent.findMany({
        where: { category: agent.category, id: { not: agent.id }, status: "published", is_public: true },
        take: 4,
        orderBy: { usage_count: "desc" },
        include: { creator: { select: { id: true, name: true, avatar_url: true, is_verified: true } } },
      });

      const isOwner = session?.user?.email
        ? agent.creator.id === (await db.user.findUnique({ where: { email: session.user.email } }))?.id
        : false;

      return NextResponse.json({ agent, creator: agent.creator, isOwner, related });
    }

    // Mock fallback
    const agent = MOCK_AGENTS.find((a) => a.id === params.id);
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const related = MOCK_AGENTS.filter((a) => a.category === agent.category && a.id !== agent.id).slice(0, 4);

    return NextResponse.json({
      agent: {
        ...agent,
        prompt: `You are a helpful AI assistant specializing in ${agent.name}.\n\nWhen given user input, provide a detailed, high-quality response that:\n- Is accurate and well-structured\n- Uses clear language appropriate for the task\n- Provides actionable output the user can use immediately\n\n{{input}}`,
        parameters: [
          { name: "input", type: "textarea", required: true, defaultValue: "", helpText: "Describe what you need help with" },
          { name: "tone", type: "select", required: false, defaultValue: "professional", helpText: "The tone of the output", options: ["professional", "casual", "technical", "friendly"] },
        ],
        defaultModel: "ollama",
        temperature: 0.7,
        maxTokens: 2000,
      },
      creator: agent.creator,
      isOwner: false,
      related,
    });
  } catch (error) {
    console.error("GET /api/agents/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── PUT /api/agents/[id] ─────────────────────────────────────────────────────
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as {
      name?: string;
      description?: string;
      prompt?: string;
      parameters?: unknown;
      temperature?: number;
      max_tokens?: number;
      system_prompt?: string;
      is_public?: boolean;
      status?: string;
    };

    if (DB_AVAILABLE) {
      const user = await db.user.findUnique({ where: { email: session.user.email } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });

      const existing = await db.agent.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      if (existing.creator_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      const agent = await db.agent.update({
        where: { id: params.id },
        data: {
          ...(body.name        !== undefined && { name: body.name }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.prompt      !== undefined && { prompt: body.prompt }),
          ...(body.parameters  !== undefined && { parameters: body.parameters as object }),
          ...(body.temperature !== undefined && { temperature: body.temperature }),
          ...(body.max_tokens  !== undefined && { max_tokens: body.max_tokens }),
          ...(body.system_prompt !== undefined && { system_prompt: body.system_prompt }),
          ...(body.is_public   !== undefined && { is_public: body.is_public }),
          ...(body.status      !== undefined && { status: body.status }),
        },
        include: { creator: { select: { id: true, name: true, avatar_url: true, is_verified: true } } },
      });

      return NextResponse.json({ agent, message: "Agent updated successfully" });
    }

    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  } catch (error) {
    console.error("PUT /api/agents/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── DELETE /api/agents/[id] — soft delete (archived) ─────────────────────────
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (DB_AVAILABLE) {
      const user = await db.user.findUnique({ where: { email: session.user.email } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });

      const existing = await db.agent.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      if (existing.creator_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      await db.agent.update({ where: { id: params.id }, data: { status: "archived" } });
      return NextResponse.json({ message: "Agent archived successfully" });
    }

    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  } catch (error) {
    console.error("DELETE /api/agents/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
