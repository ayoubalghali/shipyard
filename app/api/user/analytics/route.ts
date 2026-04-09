import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, DB_AVAILABLE } from "@/lib/db";

// GET /api/user/analytics — time-series usage + earnings data for the creator dashboard
// Returns last N days of daily rollups.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const days = Math.min(parseInt(url.searchParams.get("days") ?? "30"), 90);

  if (!DB_AVAILABLE) {
    return NextResponse.json({ daily: [], agents: [] });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!dbUser) return NextResponse.json({ daily: [], agents: [] });

    // Get all the creator's agents
    const agents = await prisma.agent.findMany({
      where: { creator_id: dbUser.id },
      select: { id: true, name: true, usage_count: true, rating: true },
      orderBy: { usage_count: "desc" },
    }) as { id: string; name: string; usage_count: number; rating: number }[];

    const agentIds = agents.map((a) => a.id);
    if (agentIds.length === 0) {
      return NextResponse.json({ daily: [], agents: [] });
    }

    // Date range
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    // Fetch all executions + earnings in range
    const [executions, earnings] = await Promise.all([
      prisma.execution.findMany({
        where: {
          agent_id: { in: agentIds },
          created_at: { gte: since },
        },
        select: { agent_id: true, created_at: true, status: true },
        orderBy: { created_at: "asc" },
      }) as Promise<{ agent_id: string; created_at: Date; status: string }[]>,
      prisma.earning.findMany({
        where: {
          agent_id: { in: agentIds },
          created_at: { gte: since },
        },
        select: { agent_id: true, amount: true, created_at: true },
        orderBy: { created_at: "asc" },
      }) as Promise<{ agent_id: string; amount: number; created_at: Date }[]>,
    ]);

    // Roll up by day
    const dayMap: Record<string, { date: string; executions: number; earnings: number }> = {};

    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = { date: key, executions: 0, earnings: 0 };
    }

    for (const ex of executions) {
      const key = ex.created_at.toISOString().slice(0, 10);
      if (dayMap[key]) dayMap[key].executions++;
    }

    for (const earn of earnings) {
      const key = earn.created_at.toISOString().slice(0, 10);
      if (dayMap[key]) dayMap[key].earnings += earn.amount;
    }

    const daily = Object.values(dayMap).map((d) => ({
      ...d,
      earnings: Math.round(d.earnings * 100) / 100,
    }));

    // Per-agent breakdown
    const agentBreakdown = agents.map((a) => ({
      id: a.id,
      name: a.name,
      usage_count: a.usage_count,
      rating: a.rating,
      executions_in_range: executions.filter((e) => e.agent_id === a.id).length,
      earnings_in_range: Math.round(
        earnings.filter((e) => e.agent_id === a.id).reduce((s, e) => s + e.amount, 0) * 100
      ) / 100,
    }));

    return NextResponse.json({ daily, agents: agentBreakdown });
  } catch (err) {
    console.error("[analytics GET]", err);
    return NextResponse.json({ daily: [], agents: [] });
  }
}
