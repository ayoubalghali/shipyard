"use client";

import { useState } from "react";
import Link from "next/link";

type AgentStatus = "published" | "draft" | "archived";

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

type SortKey = "name" | "uses" | "rating" | "earnings";
type SortDir = "asc" | "desc";

interface AgentsTableProps {
  agents: DashboardAgent[];
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
}

export default function AgentsTable({ agents, onArchive, onUnarchive }: AgentsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("earnings");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [localAgents, setLocalAgents] = useState(agents);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = [...localAgents].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
    return (a[sortKey] - b[sortKey]) * dir;
  });

  const handleArchive = (id: string) => {
    setLocalAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "archived" as AgentStatus } : a))
    );
    onArchive(id);
  };

  const handleUnarchive = (id: string) => {
    setLocalAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "published" as AgentStatus } : a))
    );
    onUnarchive(id);
  };

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const SortIcon = ({ field }: { field: SortKey }) => {
    if (sortKey !== field) {
      return (
        <svg className="h-3.5 w-3.5 text-[#4B5563]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDir === "asc" ? (
      <svg className="h-3.5 w-3.5 text-[#00D9FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="h-3.5 w-3.5 text-[#00D9FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const STATUS_STYLES: Record<AgentStatus, string> = {
    published: "bg-[#10B981]/10 text-[#10B981]",
    draft: "bg-[#F59E0B]/10 text-[#F59E0B]",
    archived: "bg-[#6B7280]/10 text-[#6B7280]",
  };

  return (
    <div className="rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2A3A4E] px-5 py-4">
        <h2 className="text-base font-semibold text-white">My Agents</h2>
        <Link
          href="/create"
          className="flex items-center gap-1.5 rounded-[6px] bg-[#2563EB] px-4 py-2 text-xs font-medium text-white transition-all hover:bg-[#1D4ED8]"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Agent
        </Link>
      </div>

      {/* Table — desktop */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A3A4E]">
              {(
                [
                  { key: "name" as SortKey, label: "Agent Name" },
                  { key: "uses" as SortKey, label: "Uses" },
                  { key: "rating" as SortKey, label: "Rating" },
                  { key: "earnings" as SortKey, label: "Earnings" },
                ] as { key: SortKey; label: string }[]
              ).map(({ key, label }) => (
                <th key={key} className="px-5 py-3 text-left">
                  <button
                    type="button"
                    onClick={() => handleSort(key)}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280] transition-colors hover:text-white"
                  >
                    {label}
                    <SortIcon field={key} />
                  </button>
                </th>
              ))}
              <th className="px-5 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Status</span>
              </th>
              <th className="px-5 py-3 text-right">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A3A4E]">
            {sorted.map((agent) => (
              <tr key={agent.id} className="group transition-colors hover:bg-[#0D1535]">
                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium text-white">{agent.name}</p>
                    <p className="text-xs text-[#6B7280]">{agent.category}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-[#A3A3A3]">{agent.uses.toLocaleString()}</td>
                <td className="px-5 py-4 text-[#A3A3A3]">
                  {agent.rating > 0 ? (
                    <span className="flex items-center gap-1">
                      <span className="text-[#F59E0B]">★</span>
                      {agent.rating.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-[#4B5563]">—</span>
                  )}
                </td>
                <td className="px-5 py-4 font-medium text-white">{fmt(agent.earnings)}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLES[agent.status]}`}>
                    {agent.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/agent/${agent.id}`}
                      className="rounded-[4px] px-2.5 py-1.5 text-xs text-[#6B7280] transition-all hover:bg-[#1A2332] hover:text-white"
                    >
                      View
                    </Link>
                    <Link
                      href="/create"
                      className="rounded-[4px] px-2.5 py-1.5 text-xs text-[#6B7280] transition-all hover:bg-[#1A2332] hover:text-white"
                    >
                      Edit
                    </Link>
                    {agent.status === "archived" ? (
                      <button
                        type="button"
                        onClick={() => handleUnarchive(agent.id)}
                        className="rounded-[4px] px-2.5 py-1.5 text-xs text-[#6B7280] transition-all hover:bg-[#10B981]/10 hover:text-[#10B981]"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleArchive(agent.id)}
                        className="rounded-[4px] px-2.5 py-1.5 text-xs text-[#6B7280] transition-all hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="divide-y divide-[#2A3A4E] sm:hidden">
        {sorted.map((agent) => (
          <div key={agent.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{agent.name}</p>
                <p className="text-xs text-[#6B7280]">{agent.category}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLES[agent.status]}`}>
                {agent.status}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-[#A3A3A3]">
              <span>{agent.uses.toLocaleString()} uses</span>
              {agent.rating > 0 && <span>★ {agent.rating.toFixed(1)}</span>}
              <span className="font-medium text-white">{fmt(agent.earnings)}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Link
                href={`/agent/${agent.id}`}
                className="rounded-[4px] border border-[#2A3A4E] px-3 py-1.5 text-xs text-[#A3A3A3] hover:border-[#2563EB] hover:text-white"
              >
                View
              </Link>
              <Link
                href="/create"
                className="rounded-[4px] border border-[#2A3A4E] px-3 py-1.5 text-xs text-[#A3A3A3] hover:border-[#2563EB] hover:text-white"
              >
                Edit
              </Link>
              {agent.status === "archived" ? (
                <button
                  type="button"
                  onClick={() => handleUnarchive(agent.id)}
                  className="rounded-[4px] border border-[#2A3A4E] px-3 py-1.5 text-xs text-[#A3A3A3] hover:border-[#10B981] hover:text-[#10B981]"
                >
                  Restore
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleArchive(agent.id)}
                  className="rounded-[4px] border border-[#2A3A4E] px-3 py-1.5 text-xs text-[#A3A3A3] hover:border-[#EF4444] hover:text-[#EF4444]"
                >
                  Archive
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="px-5 py-12 text-center text-sm text-[#6B7280]">
          No agents yet.{" "}
          <Link href="/create" className="text-[#2563EB] hover:underline">
            Create your first agent →
          </Link>
        </div>
      )}
    </div>
  );
}
