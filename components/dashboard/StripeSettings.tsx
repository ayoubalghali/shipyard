"use client";

import { useState } from "react";

interface StripeSettingsProps {
  stripeStatus: "not_connected" | "connected" | "pending";
}

interface WithdrawalRecord {
  id: string;
  date: string;
  amount: number;
  status: "completed" | "processing";
}

// Mock withdrawal history
const MOCK_WITHDRAWALS: WithdrawalRecord[] = [
  { id: "w1", date: "2026-03-01T00:00:00Z", amount: 312.5, status: "completed" },
  { id: "w2", date: "2026-02-01T00:00:00Z", amount: 215.0, status: "completed" },
  { id: "w3", date: "2026-01-01T00:00:00Z", amount: 180.25, status: "completed" },
];

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function StripeSettings({ stripeStatus }: StripeSettingsProps) {
  const [open, setOpen] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);

  const handleConnectStripe = async () => {
    setConnectingStripe(true);
    try {
      const res = await fetch("/api/stripe/connect");
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url; // redirect to Stripe OAuth
      } else {
        window.alert(data.error ?? "Could not start Stripe Connect. Check that STRIPE_CLIENT_ID is set.");
        setConnectingStripe(false);
      }
    } catch {
      window.alert("Network error. Try again.");
      setConnectingStripe(false);
    }
  };

  return (
    <div className="rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[#0D1535]"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#6366F1]/10 text-[#818CF8]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Stripe &amp; Withdrawals</p>
            <p className="text-xs text-[#6B7280]">
              {stripeStatus === "connected"
                ? "Connected — ready to withdraw"
                : stripeStatus === "pending"
                ? "Verification pending"
                : "Not connected"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
              stripeStatus === "connected"
                ? "bg-[#10B981]/10 text-[#10B981]"
                : stripeStatus === "pending"
                ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                : "bg-[#EF4444]/10 text-[#EF4444]"
            }`}
          >
            {stripeStatus === "connected" ? "Connected" : stripeStatus === "pending" ? "Pending" : "Not Connected"}
          </span>
          <svg
            className={`h-4 w-4 text-[#6B7280] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-[#2A3A4E] p-5 space-y-5">
          {/* Stripe connection */}
          {stripeStatus !== "connected" && (
            <div className="rounded-[6px] border border-[#6366F1]/20 bg-[#6366F1]/5 p-4">
              <p className="text-sm font-medium text-white">Connect your Stripe account</p>
              <p className="mt-1 text-xs text-[#A3A3A3]">
                Connect Stripe to receive payouts directly to your bank account. Shipyard takes a 20% platform fee.
              </p>
              <button
                type="button"
                onClick={handleConnectStripe}
                disabled={connectingStripe}
                className="mt-3 flex items-center gap-2 rounded-[6px] bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#4F46E5] disabled:opacity-60"
              >
                {connectingStripe ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connecting…
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Connect Stripe Account
                  </>
                )}
              </button>
            </div>
          )}

          {/* Platform fee info */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Platform Fee", value: "20%" },
              { label: "Payout Schedule", value: "Monthly" },
              { label: "Min. Payout", value: "$25.00" },
            ].map((item) => (
              <div key={item.label} className="rounded-[6px] border border-[#2A3A4E] p-3">
                <p className="text-xs text-[#6B7280]">{item.label}</p>
                <p className="mt-0.5 text-sm font-medium text-white">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Withdrawal history */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Withdrawal History</p>
            {MOCK_WITHDRAWALS.length > 0 ? (
              <div className="divide-y divide-[#2A3A4E] rounded-[6px] border border-[#2A3A4E] overflow-hidden">
                {MOCK_WITHDRAWALS.map((w) => (
                  <div key={w.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm text-white">{fmt(w.amount)}</p>
                      <p className="text-xs text-[#6B7280]">{formatDate(w.date)}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize ${
                        w.status === "completed"
                          ? "bg-[#10B981]/10 text-[#10B981]"
                          : "bg-[#F59E0B]/10 text-[#F59E0B]"
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#4B5563]">No withdrawals yet.</p>
            )}
          </div>

          {/* Tax info */}
          <div className="rounded-[6px] border border-[#2A3A4E] p-4">
            <p className="text-sm font-medium text-white">Tax Information</p>
            <p className="mt-1 text-xs text-[#A3A3A3]">
              US creators earning over $600/year will receive a 1099-K. Submit your W-9 to avoid backup withholding.
            </p>
            <button
              type="button"
              className="mt-3 rounded-[4px] border border-[#2A3A4E] px-3 py-1.5 text-xs text-[#A3A3A3] transition-all hover:border-[#2563EB] hover:text-white"
            >
              Submit W-9 Form
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
