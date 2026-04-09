import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, DB_AVAILABLE } from "@/lib/db";
import { MOCK_AGENTS } from "@/lib/mockData";
import { notifySystem } from "@/lib/notify";

type RouteContext = { params: { id: string } };

// POST /api/agents/[id]/clone — fork an agent to the caller's account
export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { name?: string };

  if (DB_AVAILABLE) {
    try {
      const [user, original] = await Promise.all([
        db.user.findUnique({ where: { email: session.user.email } }),
        db.agent.findUnique({ where: { id: params.id } }),
      ]);

      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      if (!original) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      if (!original.is_public && original.creator_id !== user.id) {
        return NextResponse.json({ error: "Cannot clone a private agent" }, { status: 403 });
      }

      const clonedName = body.name?.trim() || `${original.name} (copy)`;

      const cloned = await db.agent.create({
        data: {
          name: clonedName,
          description: original.description,
          category: original.category,
          tags: original.tags,
          prompt: original.prompt,
          parameters: original.parameters as object,
          system_prompt: original.system_prompt,
          default_model: original.default_model,
          temperature: original.temperature,
          max_tokens: original.max_tokens,
          is_public: false, // clones start as private drafts
          status: "draft",
          creator_id: user.id,
        },
        include: { creator: { select: { id: true, name: true, avatar_url: true, is_verified: true } } },
      });

      // Notify the original creator (if different user)
      if (original.creator_id !== user.id) {
        await notifySystem(
          original.creator_id,
          "Your agent was cloned!",
          `${user.name} forked "${original.name}" to their workspace`,
          `/agent/${original.id}`
        );
      }

      return NextResponse.json({ agent: cloned, message: "Agent cloned successfully" }, { status: 201 });
    } catch (err) {
      console.error("POST /api/agents/[id]/clone:", err);
      return NextResponse.json({ error: "Clone failed" }, { status: 500 });
    }
  }

  // Mock fallback
  const original = MOCK_AGENTS.find((a) => a.id === params.id);
  if (!original) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  return NextResponse.json({
    agent: {
      ...original,
      id: `clone_${Date.now()}`,
      name: body.name?.trim() || `${original.name} (copy)`,
      status: "draft",
    },
    message: "Agent cloned (mock mode)",
  }, { status: 201 });
}
