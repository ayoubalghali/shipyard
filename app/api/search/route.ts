import { NextRequest, NextResponse } from "next/server";
import { db, DB_AVAILABLE } from "@/lib/db";
import { MOCK_AGENTS } from "@/lib/mockData";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const type = (searchParams.get("type") ?? "agents") as "agents" | "creators";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);

    if (!q) {
      return NextResponse.json({ results: [], total: 0 });
    }

    if (DB_AVAILABLE) {
      if (type === "creators") {
        const creators = await db.user.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { bio: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          },
          take: limit,
          select: {
            id: true,
            name: true,
            avatar_url: true,
            bio: true,
            is_verified: true,
            total_earned: true,
            _count: { select: { agents: true } },
          },
        });
        return NextResponse.json({ results: creators, total: creators.length });
      }

      // Agent search
      const agents = await db.agent.findMany({
        where: {
          status: "published",
          is_public: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { tags: { has: q.toLowerCase() } },
          ],
        },
        take: limit,
        orderBy: { usage_count: "desc" },
        include: { creator: { select: { id: true, name: true, avatar_url: true, is_verified: true } } },
      });

      return NextResponse.json({ results: agents, total: agents.length });
    }

    // Mock fallback
    const lower = q.toLowerCase();
    const results = MOCK_AGENTS.filter(
      (a) =>
        a.name.toLowerCase().includes(lower) ||
        a.description.toLowerCase().includes(lower) ||
        a.category.toLowerCase().includes(lower) ||
        a.tags.some((t) => t.toLowerCase().includes(lower))
    ).slice(0, limit);

    return NextResponse.json({ results, total: results.length });
  } catch (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
