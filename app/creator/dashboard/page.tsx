"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import EarningsHeader from "@/components/dashboard/EarningsHeader";
import QuickStats from "@/components/dashboard/QuickStats";
import EarningsChart from "@/components/dashboard/EarningsChart";
import AgentsTable from "@/components/dashboard/AgentsTable";
import EarningsTable from "@/components/dashboard/EarningsTable";
import AgentAnalytics from "@/components/dashboard/AgentAnalytics";
import StripeSettings from "@/components/dashboard/StripeSettings";

// ---- Types ---- //
type AgentStatus = "published" | "draft" | "archived";
type EarningStatus = "pending" | "paid";
type StripeStatus = "not_connected" | "connected" | "pending";

interface DashboardSummary {
  thisMonth: number;
  available: number;
  totalEarned: number;
  totalUses: number;
  agentCount: number;
  averageRating: number;
}

interface DashboardAgent {
  id: string;
  name: string;
  category: string;
  uses: number;
  rating: number;
  earnings: number;
  status: AgentStatus;
  createdAt: string;
}

interface EarningRow {
  id: string;
  date: string;
  agentName: string;
  uses: number;
  amount: number;
  status: EarningStatus;
}

interface MonthlyPoint {
  month: string;
  amount: number;
}

interface AnalyticsEntry {
  agentId: string;
  agentName: string;
  dailyUses: { day: number; uses: number; earnings: number }[];
  ratingTrend: { month: string; rating: number }[];
  totalEarnings: number;
  totalUses: number;
}

interface DashboardData {
  summary: DashboardSummary;
  monthlyEarnings: MonthlyPoint[];
  agents: DashboardAgent[];
  recentEarnings: EarningRow[];
  agentAnalytics: AnalyticsEntry[];
  stripeStatus: StripeStatus;
  lastUpdated: string;
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-32 rounded-[12px] bg-[#0A0E27]" />
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 rounded-[8px] bg-[#0A0E27]" />
        ))}
      </div>
      <div className="h-64 rounded-[8px] bg-[#0A0E27]" />
      <div className="h-48 rounded-[8px] bg-[#0A0E27]" />
    </div>
  );
}

export default function CreatorDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/creator/dashboard");
    }
  }, [status, router]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/user/earnings");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const json = (await res.json()) as DashboardData;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount (and poll every 30s for "real-time" feel)
  useEffect(() => {
    if (status === "authenticated") {
      void fetchData();
      const interval = setInterval(() => void fetchData(), 30_000);
      return () => clearInterval(interval);
    }
  }, [status, fetchData]);

  // Loading / auth-check spinner
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <svg className="h-6 w-6 animate-spin text-[#2563EB]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        {/* Page heading */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-[32px] font-semibold leading-[1.2] text-white">
              Welcome, {session?.user?.name?.split(" ")[0] ?? "Creator"}!
            </h1>
            <p className="mt-1 text-sm text-[#A3A3A3]">Here&apos;s how your agents are performing.</p>
          </div>
          <button
            type="button"
            onClick={() => { setLoading(true); void fetchData(); }}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-[6px] border border-[#2A3A4E] px-3 py-2 text-xs text-[#6B7280] transition-all hover:border-[#2563EB] hover:text-white disabled:opacity-40"
            title="Refresh"
          >
            <svg className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-[6px] border border-[#EF4444]/20 bg-[#EF4444]/5 p-4">
            <svg className="h-4 w-4 shrink-0 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-[#EF4444]">{error}</p>
            <button
              type="button"
              onClick={() => { setError(null); void fetchData(); }}
              className="ml-auto text-xs text-[#EF4444] underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading && !data ? (
          <DashboardSkeleton />
        ) : data ? (
          <div className="flex flex-col gap-8">
            {/* Earnings hero */}
            <EarningsHeader
              thisMonth={data.summary.thisMonth}
              available={data.summary.available}
              lastUpdated={data.lastUpdated}
              stripeStatus={data.stripeStatus}
            />

            {/* Quick stats */}
            <QuickStats
              agentCount={data.summary.agentCount}
              totalUses={data.summary.totalUses}
              averageRating={data.summary.averageRating}
            />

            {/* Earnings area chart */}
            <EarningsChart data={data.monthlyEarnings} />

            {/* My agents table */}
            <AgentsTable
              agents={data.agents}
              onArchive={(id) => console.log("archive", id)}
              onUnarchive={(id) => console.log("unarchive", id)}
            />

            {/* Recent earnings */}
            <EarningsTable earnings={data.recentEarnings} />

            {/* Per-agent analytics */}
            <AgentAnalytics data={data.agentAnalytics} />

            {/* Stripe settings */}
            <section>
              <h2 className="mb-3 text-base font-semibold text-white">Settings</h2>
              <StripeSettings stripeStatus={data.stripeStatus} />
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
