"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  created_at: string;
}

const TYPE_ICON: Record<string, string> = {
  review: "⭐",
  earning: "💰",
  execution: "⚡",
  system: "📢",
  follow: "👤",
};

const TYPE_LABEL: Record<string, string> = {
  review: "Review",
  earning: "Earning",
  execution: "Run",
  system: "System",
  follow: "Follow",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchPage = useCallback(async (nextOffset: number, append = false) => {
    setLoading(true);
    const res = await fetch(`/api/notifications?limit=20&offset=${nextOffset}`);
    if (!res.ok) { setLoading(false); return; }
    const data = await res.json() as { notifications: Notification[]; unreadCount: number; hasMore: boolean };
    setNotifications((prev) => append ? [...prev, ...data.notifications] : data.notifications);
    setUnreadCount(data.unreadCount ?? 0);
    setHasMore(data.hasMore);
    setOffset(nextOffset + 20);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchPage(0);
  }, [status, fetchPage]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const dismiss = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
  };

  const FILTERS = ["all", "review", "earning", "execution", "system"];
  const visible = filter === "all" ? notifications : notifications.filter((n) => n.type === filter);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main id="main-content" className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-[#6B7280] mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-[#2563EB] hover:text-[#00D9FF] transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-[#2563EB] text-white"
                  : "border border-[#2A3A4E] text-[#A3A3A3] hover:text-white hover:border-[#2563EB]/50"
              }`}
            >
              {f === "all" ? "All" : TYPE_LABEL[f] ?? f}
            </button>
          ))}
        </div>

        {/* List */}
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center py-24">
            <div className="w-7 h-7 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-lg font-medium text-white mb-1">All caught up</p>
            <p className="text-sm text-[#6B7280]">No {filter !== "all" ? filter : ""} notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {visible.map((n) => {
                const card = (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.18 }}
                    className={`relative group flex gap-4 p-4 rounded-xl border transition-colors ${
                      !n.read
                        ? "bg-[#0D1535] border-[#2563EB]/30 hover:border-[#2563EB]/60"
                        : "bg-[#0A0E27] border-[#2A3A4E] hover:border-[#2A3A4E]/80"
                    }`}
                  >
                    {!n.read && (
                      <span className="absolute top-4 left-3 w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                    )}
                    <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">
                      {TYPE_ICON[n.type] ?? "🔔"}
                    </span>
                    <div className="flex-1 min-w-0" onClick={() => !n.read && markRead(n.id)}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-white leading-snug">{n.title}</p>
                        <span className="text-xs text-[#4B5563] flex-shrink-0 mt-0.5">{timeAgo(n.created_at)}</span>
                      </div>
                      <p className="text-sm text-[#6B7280] leading-snug mt-0.5">{n.body}</p>
                      <span className={`inline-block mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                        n.type === "earning" ? "bg-[#F59E0B]/20 text-[#F59E0B]" :
                        n.type === "review" ? "bg-[#2563EB]/20 text-[#2563EB]" :
                        n.type === "execution" ? "bg-[#10B981]/20 text-[#10B981]" :
                        "bg-[#6B7280]/20 text-[#6B7280]"
                      }`}>
                        {TYPE_LABEL[n.type] ?? n.type}
                      </span>
                    </div>
                    <button
                      onClick={() => dismiss(n.id)}
                      aria-label="Dismiss"
                      className="opacity-0 group-hover:opacity-100 self-start text-[#4B5563] hover:text-[#EF4444] transition-all flex-shrink-0 mt-0.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </motion.div>
                );

                return n.link ? (
                  <Link key={n.id} href={n.link}>{card}</Link>
                ) : (
                  <div key={n.id}>{card}</div>
                );
              })}
            </AnimatePresence>

            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => fetchPage(offset, true)}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg border border-[#2A3A4E] text-sm text-[#A3A3A3] hover:text-white hover:border-[#2563EB] transition-colors disabled:opacity-40"
                >
                  {loading ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
