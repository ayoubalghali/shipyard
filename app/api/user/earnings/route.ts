import { NextResponse } from "next/server";

// Mock data — replace with Prisma queries in Week 5+ (DB integration)
export async function GET() {
  const now = new Date();

  // Monthly earnings for the last 12 months
  const monthlyEarnings = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return {
      month: d.toLocaleString("default", { month: "short", year: "2-digit" }),
      amount: Math.round((Math.random() * 400 + 50) * 100) / 100,
    };
  });

  // Mock agents with stats
  const agents = [
    {
      id: "1",
      name: "Blog Post Generator",
      category: "Content",
      uses: 847,
      rating: 4.8,
      earnings: 423.5,
      status: "published" as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    },
    {
      id: "2",
      name: "Code Reviewer",
      category: "Code",
      uses: 521,
      rating: 4.9,
      earnings: 260.5,
      status: "published" as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    },
    {
      id: "3",
      name: "Email Drafter",
      category: "Workflows",
      uses: 312,
      rating: 4.6,
      earnings: 156.0,
      status: "published" as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    },
    {
      id: "4",
      name: "SEO Meta Generator",
      category: "Marketing",
      uses: 189,
      rating: 4.5,
      earnings: 94.5,
      status: "published" as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
    {
      id: "5",
      name: "Resume Analyzer",
      category: "Workflows",
      uses: 0,
      rating: 0,
      earnings: 0,
      status: "draft" as const,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
  ];

  // Recent earnings transactions
  const agentNames = ["Blog Post Generator", "Code Reviewer", "Email Drafter", "SEO Meta Generator"];
  const recentEarnings = Array.from({ length: 40 }, (_, i) => {
    const daysAgo = Math.floor(i / 3);
    const agentName = agentNames[i % agentNames.length];
    const amount = Math.round((Math.random() * 15 + 1) * 100) / 100;
    return {
      id: `earn_${i}`,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * daysAgo).toISOString(),
      agentName,
      uses: Math.floor(Math.random() * 10) + 1,
      amount,
      status: daysAgo > 14 ? ("paid" as const) : ("pending" as const),
    };
  });

  // Agent analytics data (uses over time, last 30 days per agent)
  const agentAnalytics = agents.slice(0, 4).map((agent) => ({
    agentId: agent.id,
    agentName: agent.name,
    dailyUses: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      uses: Math.floor(Math.random() * 30) + 1,
      earnings: Math.round((Math.random() * 10 + 0.5) * 100) / 100,
    })),
    ratingTrend: Array.from({ length: 6 }, (_, i) => ({
      month: new Date(now.getFullYear(), now.getMonth() - (5 - i), 1).toLocaleString("default", {
        month: "short",
      }),
      rating: Math.round((agent.rating - 0.3 + Math.random() * 0.6) * 10) / 10,
    })),
    totalEarnings: agent.earnings,
    totalUses: agent.uses,
  }));

  const thisMonthEarnings = monthlyEarnings[monthlyEarnings.length - 1].amount;
  const totalEarned = agents.reduce((sum, a) => sum + a.earnings, 0);
  const available = Math.round(totalEarned * 0.3 * 100) / 100;

  return NextResponse.json({
    summary: {
      thisMonth: thisMonthEarnings,
      available,
      totalEarned,
      totalUses: agents.reduce((sum, a) => sum + a.uses, 0),
      agentCount: agents.length,
      averageRating:
        Math.round(
          (agents.filter((a) => a.rating > 0).reduce((sum, a) => sum + a.rating, 0) /
            agents.filter((a) => a.rating > 0).length) *
            10
        ) / 10,
    },
    monthlyEarnings,
    agents,
    recentEarnings,
    agentAnalytics,
    stripeStatus: "not_connected" as const,
    lastUpdated: new Date().toISOString(),
  });
}
