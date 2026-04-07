"use client";

interface QuickStatsProps {
  agentCount: number;
  totalUses: number;
  averageRating: number;
}

const STATS = (agentCount: number, totalUses: number, averageRating: number) => [
  {
    label: "Agents Created",
    value: agentCount.toString(),
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
    color: "text-[#2563EB]",
    bg: "bg-[#2563EB]/10",
  },
  {
    label: "Total Uses",
    value: totalUses.toLocaleString(),
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: "text-[#00D9FF]",
    bg: "bg-[#00D9FF]/10",
  },
  {
    label: "Average Rating",
    value: `${averageRating} ⭐`,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
  },
];

export default function QuickStats({ agentCount, totalUses, averageRating }: QuickStatsProps) {
  const stats = STATS(agentCount, totalUses, averageRating);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-4 rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] p-5"
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] ${stat.bg} ${stat.color}`}>
            {stat.icon}
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">{stat.label}</p>
            <p className="mt-0.5 text-2xl font-semibold text-white">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
