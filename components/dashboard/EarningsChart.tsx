"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthlyPoint {
  month: string;
  amount: number;
}

interface EarningsChartProps {
  data: MonthlyPoint[];
}

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function EarningsChart({ data }: EarningsChartProps) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const peak = Math.max(...data.map((d) => d.amount));

  return (
    <div className="rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Earnings Over Time</h2>
          <p className="mt-0.5 text-xs text-[#6B7280]">Last 12 months</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#6B7280]">Total</p>
          <p className="text-lg font-semibold text-[#00D9FF]">{fmt(total)}</p>
          <p className="text-[10px] text-[#4B5563]">Peak: {fmt(peak)}</p>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3A4E" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6B7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6B7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0A0E27",
                border: "1px solid #2A3A4E",
                borderRadius: "6px",
                color: "#fff",
                fontSize: 12,
              }}
              formatter={(value: unknown) => [fmt(value as number), "Earnings"]}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#00D9FF"
              strokeWidth={2}
              fill="url(#earningsGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#00D9FF" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
