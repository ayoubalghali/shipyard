"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DailyPoint {
  date: string;
  executions: number;
  earnings: number;
}

interface AgentBreakdown {
  id: string;
  name: string;
  usage_count: number;
  rating: number;
  executions_in_range: number;
  earnings_in_range: number;
}

const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

const fmtUsd = (v: unknown) =>
  `$${(v as number).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AnalyticsPanel() {
  const [days, setDays] = useState(30);
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [agents, setAgents] = useState<AgentBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/user/analytics?days=${days}`)
      .then((r) => r.json())
      .then((d: { daily?: DailyPoint[]; agents?: AgentBreakdown[] }) => {
        setDaily(d.daily ?? []);
        setAgents(d.agents ?? []);
      })
      .catch(() => {/* non-fatal */})
      .finally(() => setLoading(false));
  }, [days]);

  // Thin the x-axis labels for readability
  const tickEvery = days <= 14 ? 1 : days <= 30 ? 3 : 7;

  const totalExecutions = daily.reduce((s, d) => s + d.executions, 0);
  const totalEarnings = daily.reduce((s, d) => s + d.earnings, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">Analytics</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">Real-time performance of your agents</p>
        </div>
        <div className="flex gap-1.5">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                days === d
                  ? "bg-[#2563EB] text-white"
                  : "bg-[#0A0E27] border border-[#2A3A4E] text-[#A3A3A3] hover:border-[#2563EB]"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0A0E27] border border-[#2A3A4E] rounded-lg p-4">
          <p className="text-xs text-[#6B7280]">Executions</p>
          <p className="text-2xl font-semibold text-white mt-1">{totalExecutions.toLocaleString()}</p>
          <p className="text-xs text-[#4B5563] mt-0.5">last {days} days</p>
        </div>
        <div className="bg-[#0A0E27] border border-[#2A3A4E] rounded-lg p-4">
          <p className="text-xs text-[#6B7280]">Earnings</p>
          <p className="text-2xl font-semibold text-[#00D9FF] mt-1">${totalEarnings.toFixed(2)}</p>
          <p className="text-xs text-[#4B5563] mt-0.5">last {days} days</p>
        </div>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : daily.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-[#6B7280] text-sm">
          No data yet. Run your agents to see analytics here.
        </div>
      ) : (
        <>
          {/* Executions area chart */}
          <div className="bg-[#0A0E27] border border-[#2A3A4E] rounded-lg p-5">
            <p className="text-sm font-medium text-white mb-4">Executions per Day</p>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="execGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3A4E" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#6B7280", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v, i) => (i % tickEvery === 0 ? fmtDate(v as string) : "")}
                  />
                  <YAxis
                    tick={{ fill: "#6B7280", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A0E27",
                      border: "1px solid #2A3A4E",
                      borderRadius: "6px",
                      fontSize: 12,
                      color: "#fff",
                    }}
                    labelFormatter={(l) => fmtDate(l as string)}
                    formatter={(v: unknown) => [`${v as number}`, "Executions"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="executions"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fill="url(#execGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#2563EB" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Earnings area chart */}
          <div className="bg-[#0A0E27] border border-[#2A3A4E] rounded-lg p-5">
            <p className="text-sm font-medium text-white mb-4">Earnings per Day</p>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="earningsGradLive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3A4E" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#6B7280", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v, i) => (i % tickEvery === 0 ? fmtDate(v as string) : "")}
                  />
                  <YAxis
                    tick={{ fill: "#6B7280", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A0E27",
                      border: "1px solid #2A3A4E",
                      borderRadius: "6px",
                      fontSize: 12,
                      color: "#fff",
                    }}
                    labelFormatter={(l) => fmtDate(l as string)}
                    formatter={fmtUsd}
                  />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#00D9FF"
                    strokeWidth={2}
                    fill="url(#earningsGradLive)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#00D9FF" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per-agent bar chart */}
          {agents.length > 0 && (
            <div className="bg-[#0A0E27] border border-[#2A3A4E] rounded-lg p-5">
              <p className="text-sm font-medium text-white mb-4">Agent Performance</p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={agents.slice(0, 8)}
                    margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A3A4E" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: "#6B7280", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: "#A3A3A3", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={90}
                      tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 13) + "…" : v}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0A0E27",
                        border: "1px solid #2A3A4E",
                        borderRadius: "6px",
                        fontSize: 12,
                        color: "#fff",
                      }}
                      formatter={(v: unknown, name: unknown) => [
                        name === "executions_in_range" ? `${v as number} runs` : fmtUsd(v),
                        name === "executions_in_range" ? "Executions" : "Earnings",
                      ]}
                    />
                    <Legend
                      formatter={(v) => v === "executions_in_range" ? "Executions" : "Earnings ($)"}
                      wrapperStyle={{ fontSize: 11, color: "#6B7280" }}
                    />
                    <Bar dataKey="executions_in_range" fill="#2563EB" radius={[0, 3, 3, 0]} />
                    <Bar dataKey="earnings_in_range" fill="#00D9FF" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
