"use client";

import { useState } from "react";

type EarningStatus = "pending" | "paid";

interface EarningRow {
  id: string;
  date: string;
  agentName: string;
  uses: number;
  amount: number;
  status: EarningStatus;
}

interface EarningsTableProps {
  earnings: EarningRow[];
}

const PAGE_SIZE = 20;

export default function EarningsTable({ earnings }: EarningsTableProps) {
  const [page, setPage] = useState(0);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = [...earnings].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return sortDir === "desc" ? db - da : da - db;
  });

  const total = sorted.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2A3A4E] px-5 py-4">
        <h2 className="text-base font-semibold text-white">Recent Earnings</h2>
        <button
          type="button"
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="flex items-center gap-1.5 text-xs text-[#6B7280] transition-colors hover:text-white"
          title="Sort by date"
        >
          Date
          {sortDir === "desc" ? (
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A3A4E]">
              {["Date", "Agent", "Uses", "Amount", "Status"].map((col) => (
                <th key={col} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A3A4E]">
            {paginated.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-[#0D1535]">
                <td className="px-5 py-3.5 text-[#A3A3A3]">{formatDate(row.date)}</td>
                <td className="px-5 py-3.5 font-medium text-white">{row.agentName}</td>
                <td className="px-5 py-3.5 text-[#A3A3A3]">{row.uses}</td>
                <td className="px-5 py-3.5 font-medium text-white">{fmt(row.amount)}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize ${
                      row.status === "paid"
                        ? "bg-[#10B981]/10 text-[#10B981]"
                        : "bg-[#F59E0B]/10 text-[#F59E0B]"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="divide-y divide-[#2A3A4E] sm:hidden">
        {paginated.map((row) => (
          <div key={row.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-white">{row.agentName}</p>
              <p className="text-xs text-[#6B7280]">{formatDate(row.date)} · {row.uses} uses</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-white">{fmt(row.amount)}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                  row.status === "paid" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"
                }`}
              >
                {row.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-[#2A3A4E] px-5 py-3">
          <p className="text-xs text-[#6B7280]">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-[4px] border border-[#2A3A4E] px-2.5 py-1.5 text-xs text-[#6B7280] transition-all hover:border-[#2563EB] hover:text-white disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              disabled={page >= pages - 1}
              className="rounded-[4px] border border-[#2A3A4E] px-2.5 py-1.5 text-xs text-[#6B7280] transition-all hover:border-[#2563EB] hover:text-white disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
