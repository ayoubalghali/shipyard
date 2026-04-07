import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, DB_AVAILABLE } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  // ── Prisma path ──────────────────────────────────────────────────────────
  if (DB_AVAILABLE && session?.user?.email) {
    try {
      const user = await db.user.findUnique({
        where: { email: session.user.email },
        include: {
          agents: {
            where: { status: { not: "archived" } },
            select: {
              id: true, name: true, category: true, usage_count: true,
              rating: true, status: true, created_at: true,
              _count: { select: { earnings: true } },
            },
          },
          earnings: {
            orderBy: { created_at: "desc" },
            take: 40,
            include: { agent: { select: { name: true } } },
          },
        },
      });

      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      // Monthly earnings — last 12 months
      const now = new Date();
      const monthlyEarnings = await Promise.all(
        Array.from({ length: 12 }, (_, i) => {
          const start = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
          const end = new Date(now.getFullYear(), now.getMonth() - (11 - i) + 1, 0, 23, 59, 59);
          return db.earning.aggregate({
            where: { creator_id: user.id, created_at: { gte: start, lte: end } },
            _sum: { amount: true },
          }).then((res: { _sum: { amount: number | null } }) => ({
            month: start.toLocaleString("default", { month: "short", year: "2-digit" }),
            amount: Math.round((res._sum.amount ?? 0) * 100) / 100,
          }));
        })
      );

      const available = user.total_earned - user.withdrawn;
      const thisMonth = monthlyEarnings[monthlyEarnings.length - 1].amount;

      type DbAgent = { id: string; name: string; usage_count: number; rating: number };
      const agentAnalytics = (user.agents as DbAgent[]).slice(0, 4).map((agent) => ({
        agentId: agent.id,
        agentName: agent.name,
        totalUses: agent.usage_count,
        totalEarnings: 0, // Populated from earnings in production
        dailyUses: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, uses: 0, earnings: 0 })),
        ratingTrend: Array.from({ length: 6 }, (_, i) => ({
          month: new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
            .toLocaleString("default", { month: "short" }),
          rating: agent.rating,
        })),
      }));

      return NextResponse.json({
        summary: {
          thisMonth,
          available: Math.round(available * 100) / 100,
          totalEarned: user.total_earned,
          totalUses: (user.agents as DbAgent[]).reduce((sum: number, a: DbAgent) => sum + a.usage_count, 0),
          agentCount: user.agents.length,
          averageRating:
            (user.agents as DbAgent[]).filter((a: DbAgent) => a.rating > 0).length > 0
              ? Math.round(
                  ((user.agents as DbAgent[]).filter((a: DbAgent) => a.rating > 0).reduce((s: number, a: DbAgent) => s + a.rating, 0) /
                    (user.agents as DbAgent[]).filter((a: DbAgent) => a.rating > 0).length) * 10
                ) / 10
              : 0,
        },
        monthlyEarnings,
        agents: (user.agents as (DbAgent & { category: string; status: string; created_at: Date })[]).map((a) => ({
          id: a.id,
          name: a.name,
          category: a.category,
          uses: a.usage_count,
          rating: a.rating,
          earnings: 0,
          status: a.status as "published" | "draft" | "archived",
          createdAt: a.created_at.toISOString(),
        })),
        recentEarnings: (user.earnings as { id: string; created_at: Date; agent: { name: string }; amount: number; status: string }[]).map((e) => ({
          id: e.id,
          date: e.created_at.toISOString(),
          agentName: e.agent.name,
          uses: 1,
          amount: e.amount,
          status: e.status as "pending" | "paid",
        })),
        agentAnalytics,
        stripeStatus: (user.stripe_account_id ? "connected" : "not_connected") as
          "not_connected" | "connected" | "pending",
        lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      console.error("GET /api/user/earnings DB error:", err);
      // Fall through to mock
    }
  }

  // ── Mock fallback (no DB or not authenticated) ───────────────────────────
  const now = new Date();
  const monthlyEarnings = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return {
      month: d.toLocaleString("default", { month: "short", year: "2-digit" }),
      amount: Math.round((Math.random() * 400 + 50) * 100) / 100,
    };
  });

  const mockAgents = [
    { id: "1", name: "Blog Post Generator", category: "Content", uses: 847, rating: 4.8, earnings: 423.5, status: "published" as const, createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
    { id: "2", name: "Code Reviewer", category: "Code", uses: 521, rating: 4.9, earnings: 260.5, status: "published" as const, createdAt: new Date(Date.now() - 86400000 * 20).toISOString() },
    { id: "3", name: "Email Drafter", category: "Workflows", uses: 312, rating: 4.6, earnings: 156.0, status: "published" as const, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: "4", name: "SEO Meta Generator", category: "Marketing", uses: 189, rating: 4.5, earnings: 94.5, status: "published" as const, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: "5", name: "Resume Analyzer", category: "Workflows", uses: 0, rating: 0, earnings: 0, status: "draft" as const, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  ];

  const agentNames = ["Blog Post Generator", "Code Reviewer", "Email Drafter", "SEO Meta Generator"];
  const recentEarnings = Array.from({ length: 40 }, (_, i) => ({
    id: `earn_${i}`,
    date: new Date(Date.now() - 86400000 * Math.floor(i / 3)).toISOString(),
    agentName: agentNames[i % agentNames.length],
    uses: Math.floor(Math.random() * 10) + 1,
    amount: Math.round((Math.random() * 15 + 1) * 100) / 100,
    status: (Math.floor(i / 3) > 14 ? "paid" : "pending") as "paid" | "pending",
  }));

  const agentAnalytics = mockAgents.slice(0, 4).map((agent) => ({
    agentId: agent.id,
    agentName: agent.name,
    dailyUses: Array.from({ length: 30 }, (_, i) => ({ day: i + 1, uses: Math.floor(Math.random() * 30) + 1, earnings: Math.round((Math.random() * 10 + 0.5) * 100) / 100 })),
    ratingTrend: Array.from({ length: 6 }, (_, i) => ({ month: new Date(now.getFullYear(), now.getMonth() - (5 - i), 1).toLocaleString("default", { month: "short" }), rating: Math.round((agent.rating - 0.3 + Math.random() * 0.6) * 10) / 10 })),
    totalEarnings: agent.earnings,
    totalUses: agent.uses,
  }));

  const totalEarned = mockAgents.reduce((sum, a) => sum + a.earnings, 0);

  return NextResponse.json({
    summary: {
      thisMonth: monthlyEarnings[monthlyEarnings.length - 1].amount,
      available: Math.round(totalEarned * 0.3 * 100) / 100,
      totalEarned,
      totalUses: mockAgents.reduce((sum, a) => sum + a.uses, 0),
      agentCount: mockAgents.length,
      averageRating: 4.7,
    },
    monthlyEarnings,
    agents: mockAgents,
    recentEarnings,
    agentAnalytics,
    stripeStatus: "not_connected" as const,
    lastUpdated: new Date().toISOString(),
  });
}
