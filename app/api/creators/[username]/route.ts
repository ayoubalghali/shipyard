import { NextRequest, NextResponse } from "next/server";
import { db, DB_AVAILABLE } from "@/lib/db";
import { MOCK_AGENTS } from "@/lib/mockData";

type RouteContext = { params: { username: string } };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const slug = decodeURIComponent(params.username).toLowerCase();

    if (DB_AVAILABLE) {
      const user = await db.user.findFirst({
        where: {
          OR: [
            { name: { equals: slug, mode: "insensitive" } },
            { email: { equals: slug, mode: "insensitive" } },
            { id: slug },
          ],
        },
        include: {
          agents: {
            where: { status: "published", is_public: true },
            orderBy: { usage_count: "desc" },
          },
          _count: { select: { agents: true, favorites: true } },
        },
      });

      if (!user) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

      type DbAgent = { usage_count: number; rating: number };
      const typedAgents = user.agents as DbAgent[];
      const ratedAgents = typedAgents.filter((a: DbAgent) => a.rating > 0);

      return NextResponse.json({
        creator: {
          id: user.id,
          name: user.name,
          avatar_url: user.avatar_url,
          bio: user.bio,
          is_verified: user.is_verified,
          total_earned: user.total_earned,
          joined: user.created_at,
          agentCount: user._count.agents,
          totalUses: typedAgents.reduce((sum: number, a: DbAgent) => sum + a.usage_count, 0),
          averageRating:
            ratedAgents.length > 0
              ? Math.round(
                  (ratedAgents.reduce((s: number, a: DbAgent) => s + a.rating, 0) / ratedAgents.length) * 10
                ) / 10
              : 0,
        },
        agents: user.agents,
      });
    }

    // Mock fallback — build a creator from mock agents
    const mockCreatorName = slug.replace(/-/g, " ");
    const creatorAgents = MOCK_AGENTS.filter(
      (a) => a.creator.name.toLowerCase() === mockCreatorName
    );

    if (creatorAgents.length === 0) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const creator = creatorAgents[0].creator;
    return NextResponse.json({
      creator: {
        id: creator.id,
        name: creator.name,
        avatar_url: creator.avatar,
        bio: "AI builder on Shipyard.",
        is_verified: creator.isVerified,
        total_earned: 0,
        joined: new Date(Date.now() - 86400000 * 90).toISOString(),
        agentCount: creatorAgents.length,
        totalUses: creatorAgents.reduce((sum, a) => sum + a.usageCount, 0),
        averageRating:
          Math.round(
            (creatorAgents.reduce((s, a) => s + a.rating, 0) / creatorAgents.length) * 10
          ) / 10,
      },
      agents: creatorAgents,
    });
  } catch (error) {
    console.error("GET /api/creators/[username] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
