import { NextRequest, NextResponse } from "next/server";
import { db, DB_AVAILABLE } from "@/lib/db";
import { MOCK_AGENTS } from "@/lib/mockData";

// GET /api/leaderboard?type=agents|creators&period=week|month|all
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "agents";
  const period = url.searchParams.get("period") ?? "all";
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 50);

  // Build date filter
  let since: Date | undefined;
  if (period === "week") since = new Date(Date.now() - 7 * 86400_000);
  else if (period === "month") since = new Date(Date.now() - 30 * 86400_000);

  if (DB_AVAILABLE) {
    try {
      if (type === "creators") {
        // Top creators by total earnings in period
        const creators = await db.user.findMany({
          take: limit,
          orderBy: { total_earned: "desc" },
          where: {
            agents: { some: { status: "published" } },
            ...(since
              ? { earnings: { some: { created_at: { gte: since } } } }
              : {}),
          },
          select: {
            id: true,
            name: true,
            avatar_url: true,
            is_verified: true,
            total_earned: true,
            _count: { select: { agents: true } },
          },
        });

        // Get execution count per creator in period
        type CreatorRow = typeof creators[number];
        const withStats = await Promise.all(
          creators.map(async (c: CreatorRow) => {
            const execCount = await db.execution.count({
              where: {
                agent: { creator_id: c.id },
                ...(since ? { created_at: { gte: since } } : {}),
              },
            });
            return { ...c, executions: execCount };
          })
        );

        return NextResponse.json({ entries: withStats, type: "creators", period });
      } else {
        // Top agents by usage_count or recent executions
        const agents = await db.agent.findMany({
          take: limit,
          where: {
            status: "published",
            is_public: true,
            ...(since
              ? { executions: { some: { created_at: { gte: since } } } }
              : {}),
          },
          orderBy: since
            ? [{ usage_count: "desc" }]
            : [{ usage_count: "desc" }],
          include: {
            creator: { select: { id: true, name: true, avatar_url: true, is_verified: true } },
            _count: { select: { executions: true, reviews: true } },
          },
        });

        return NextResponse.json({ entries: agents, type: "agents", period });
      }
    } catch (err) {
      console.error("GET /api/leaderboard:", err);
    }
  }

  // Mock fallback
  if (type === "creators") {
    const creators = Array.from(new Set(MOCK_AGENTS.map((a) => a.creator.id))).map((id) => {
      const agent = MOCK_AGENTS.find((a) => a.creator.id === id)!;
      const count = MOCK_AGENTS.filter((a) => a.creator.id === id).length;
      return {
        id,
        name: agent.creator.name,
        avatar_url: null,
        is_verified: agent.creator.isVerified,
        total_earned: Math.random() * 500,
        executions: Math.floor(Math.random() * 300),
        _count: { agents: count },
      };
    });
    return NextResponse.json({ entries: creators.slice(0, limit), type: "creators", period });
  }

  const sorted = [...MOCK_AGENTS].sort((a, b) => b.usageCount - a.usageCount).slice(0, limit);
  return NextResponse.json({
    entries: sorted.map((a) => ({
      ...a,
      creator: { id: a.creator.id, name: a.creator.name, avatar_url: null, is_verified: a.creator.isVerified },
      _count: { executions: a.usageCount, reviews: Math.floor(a.rating * 20) },
    })),
    type: "agents",
    period,
  });
}
