"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";

// Placeholder for Feature 4 (Week 4) — protected route demo
export default function CreatorDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Protected route — redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/creator/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <svg className="h-6 w-6 animate-spin text-[#2563EB]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        <div className="mb-8">
          <h1 className="text-[32px] font-semibold leading-[1.2] text-white">
            Welcome, {session?.user?.name?.split(" ")[0] ?? "Creator"}!
          </h1>
          <p className="mt-1 text-sm text-[#A3A3A3]">
            Your creator dashboard is coming in Week 4.
          </p>
        </div>

        {/* Stats preview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
          {[
            { label: "This Month's Earnings", value: "$0.00", color: "text-[#00D9FF]" },
            { label: "Total Uses", value: "0", color: "text-white" },
            { label: "Agents Created", value: "0", color: "text-white" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] p-6"
            >
              <p className="text-xs uppercase tracking-wider text-[#6B7280]">{stat.label}</p>
              <p className={`mt-2 text-3xl font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] p-8 text-center">
          <div className="mb-4 text-4xl">⚡</div>
          <h2 className="text-xl font-semibold text-white">Creator Dashboard — Coming Week 4</h2>
          <p className="mt-2 text-sm text-[#A3A3A3] max-w-sm mx-auto">
            Full earnings tracking, agent analytics, withdrawal to Stripe, and more.
          </p>
          <Link
            href="/create"
            className="mt-6 inline-block rounded-[6px] bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#1D4ED8]"
          >
            Create Your First Agent →
          </Link>
        </div>
      </main>
    </div>
  );
}
