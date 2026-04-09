import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, DB_AVAILABLE } from "@/lib/db";
import { MOCK_AGENTS } from "@/lib/mockData";

async function isAdmin(email: string) {
  if (!DB_AVAILABLE) return email === process.env.ADMIN_EMAIL;
  try {
    const user = await db.user.findUnique({ where: { email } });
    return user?.is_admin ?? false;
  } catch {
    return false;
  }
}

// GET /api/admin/stats — platform-wide statistics
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdmin(session.user.email))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (DB_AVAILABLE) {
    try {
      const [
        totalUsers,
        totalAgents,
        totalExecutions,
        totalEarnings,
        recentExecutions,
        topAgents,
      ] = await Promise.all([
        db.user.count(),
        db.agent.count({ where: { status: "published" } }),
        db.execution.count(),
        db.earning.aggregate({ _sum: { amount: true } }),
        db.execution.findMany({
          take: 10,
          orderBy: { created_at: "desc" },
          include: { agent: { select: { name: true, category: true } }, user: { select: { name: true, email: true } } },
        }),
        db.agent.findMany({
          take: 10,
          orderBy: { usage_count: "desc" },
          where: { status: "published" },
          include: { creator: { select: { name: true } } },
        }),
      ]);

      return NextResponse.json({
        stats: {
          totalUsers,
          totalAgents,
          totalExecutions,
          totalEarningsUsd: (totalEarnings._sum.amount ?? 0).toFixed(2),
        },
        recentExecutions,
        topAgents,
      });
    } catch (err) {
      console.error("Admin stats DB error:", err);
    }
  }

  // Mock fallback
  return NextResponse.json({
    stats: {
      totalUsers: 1,
      totalAgents: MOCK_AGENTS.length,
      totalExecutions: 42,
      totalEarningsUsd: "128.00",
    },
    recentExecutions: [],
    topAgents: MOCK_AGENTS.slice(0, 5).map((a) => ({
      ...a,
      creator: { name: a.creator.name },
    })),
  });
}
