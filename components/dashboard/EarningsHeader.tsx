"use client";

import { useState } from "react";

interface EarningsHeaderProps {
  thisMonth: number;
  available: number;
  lastUpdated: string;
  stripeStatus: "not_connected" | "connected" | "pending";
}

export default function EarningsHeader({
  thisMonth,
  available,
  lastUpdated,
  stripeStatus,
}: EarningsHeaderProps) {
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawDone, setWithdrawDone] = useState(false);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const handleWithdraw = async () => {
    if (stripeStatus !== "connected") return;
    setWithdrawing(true);
    // Simulate API call — real implementation uses Stripe Connect payout
    await new Promise((r) => setTimeout(r, 1500));
    setWithdrawing(false);
    setWithdrawDone(true);
    setTimeout(() => setWithdrawDone(false), 3000);
  };

  const relativeTime = (() => {
    const diff = Date.now() - new Date(lastUpdated).getTime();
    if (diff < 60_000) return "Just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    return `${Math.floor(diff / 3_600_000)}h ago`;
  })();

  return (
    <div className="rounded-[12px] border border-[#2A3A4E] bg-gradient-to-br from-[#0A0E27] to-[#0D1535] p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        {/* Earnings */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
            This Month&apos;s Earnings
          </p>
          <p className="mt-1 text-[40px] font-semibold leading-none text-[#00D9FF]">
            {fmt(thisMonth)}
          </p>
          <p className="mt-3 text-xs text-[#4B5563]">Last updated: {relativeTime}</p>
        </div>

        {/* Available + Withdraw */}
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Available to Withdraw
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">{fmt(available)}</p>
          </div>

          {stripeStatus === "not_connected" ? (
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                className="flex items-center gap-2 rounded-[6px] border border-[#6366F1]/40 bg-[#6366F1]/10 px-4 py-2 text-sm font-medium text-[#818CF8] transition-all hover:border-[#6366F1] hover:bg-[#6366F1]/20"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Connect Stripe to Withdraw
              </button>
              <p className="text-[10px] text-[#4B5563]">Required for payouts</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleWithdraw}
              disabled={withdrawing || available === 0}
              className="flex items-center gap-2 rounded-[6px] bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {withdrawDone ? (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Payout Initiated!
                </>
              ) : withdrawing ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Withdraw {fmt(available)}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
