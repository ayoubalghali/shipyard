"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface DailyPoint {
  day: number;
  uses: number;
  earnings: number;
}

interface RatingPoint {
  month: string;
  rating: number;
}

interface AnalyticsEntry {
  agentId: string;
  agentName: string;
  dailyUses: DailyPoint[];
  ratingTrend: RatingPoint[];
  totalEarnings: number;
  totalUses: number;
}

interface AgentAnalyticsProps {
  data: AnalyticsEntry[];
}

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function AgentAnalyticsPanel({ entry }: { entry: AnalyticsEntry }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"uses" | "earnings" | "rating">("uses");

  return (
    <div className="rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] overflow-hidden">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[#0D1535]"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-sm font-semibold text-white">
            {entry.agentName[0]}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">{entry.agentName}</p>
            <p className="text-xs text-[#6B7280]">
              {entry.totalUses.toLocaleString()} uses · {fmt(entry.totalEarnings)} earned
            </p>
          </div>
        </div>
        <svg
          className={`h-4 w-4 text-[#6B7280] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#2A3A4E] p-5">
              {/* View tabs */}
              <div className="mb-4 flex gap-2">
                {(["uses", "earnings", "rating"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    className={`rounded-[4px] px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                      view === v
                        ? "bg-[#2563EB] text-white"
                        : "border border-[#2A3A4E] text-[#6B7280] hover:border-[#2563EB]/50 hover:text-white"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              {/* Chart */}
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {view === "rating" ? (
                    <LineChart data={entry.ratingTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A3A4E" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#6B7280", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[3.5, 5]}
                        tick={{ fill: "#6B7280", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0A0E27",
                          border: "1px solid #2A3A4E",
                          borderRadius: "6px",
                          color: "#fff",
                          fontSize: 12,
                        }}
                        formatter={(value: unknown) => [(value as number).toFixed(1), "Rating"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={{ fill: "#F59E0B", r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  ) : (
                    <AreaChart
                      data={entry.dailyUses}
                      margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id={`grad-uses-${entry.agentId}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id={`grad-earn-${entry.agentId}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A3A4E" />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: "#6B7280", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) => (v % 5 === 0 ? `D${v}` : "")}
                      />
                      <YAxis
                        tick={{ fill: "#6B7280", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={view === "earnings" ? (v: number) => `$${v}` : undefined}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0A0E27",
                          border: "1px solid #2A3A4E",
                          borderRadius: "6px",
                          color: "#fff",
                          fontSize: 12,
                        }}
                        formatter={
                          view === "earnings"
                            ? (value: unknown) => [fmt(value as number), "Earnings"]
                            : (value: unknown) => [value as number, "Uses"]
                        }
                        labelFormatter={(label: unknown) => `Day ${label as number}`}
                      />
                      <Area
                        type="monotone"
                        dataKey={view}
                        stroke={view === "earnings" ? "#00D9FF" : "#2563EB"}
                        strokeWidth={2}
                        fill={`url(#${view === "earnings" ? `grad-earn-${entry.agentId}` : `grad-uses-${entry.agentId}`})`}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AgentAnalytics({ data }: AgentAnalyticsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Agent Analytics</h2>
        <p className="text-xs text-[#6B7280]">Last 30 days</p>
      </div>
      <div className="flex flex-col gap-3">
        {data.map((entry) => (
          <AgentAnalyticsPanel key={entry.agentId} entry={entry} />
        ))}
      </div>
    </div>
  );
}
