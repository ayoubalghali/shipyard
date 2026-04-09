import { NextRequest, NextResponse } from "next/server";
import { prisma, DB_AVAILABLE } from "@/lib/db";
import { MOCK_AGENTS } from "@/lib/mockData";

// GET /api/search/suggestions?q=... — fast typeahead suggestions (agent names + categories)
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ suggestions: [] });

  if (DB_AVAILABLE) {
    try {
      const agents = await prisma.agent.findMany({
        where: {
          status: "published",
          name: { contains: q, mode: "insensitive" },
        },
        select: { id: true, name: true, category: true },
        take: 6,
        orderBy: { usage_count: "desc" },
      }) as { id: string; name: string; category: string }[];

      const suggestions = agents.map((a) => ({
        type: "agent" as const,
        id: a.id,
        label: a.name,
        sub: a.category,
      }));

      const res = NextResponse.json({ suggestions });
      res.headers.set("Cache-Control", "public, s-maxage=10, stale-while-revalidate=30");
      return res;
    } catch {
      // Fall through to mock
    }
  }

  // Mock fallback
  const filtered = MOCK_AGENTS
    .filter((a) => a.name.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 6)
    .map((a) => ({ type: "agent" as const, id: a.id, label: a.name, sub: a.category }));

  const mockRes = NextResponse.json({ suggestions: filtered });
  mockRes.headers.set("Cache-Control", "public, s-maxage=10, stale-while-revalidate=30");
  return mockRes;
}
