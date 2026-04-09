"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";

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

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export default function NotificationBell() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=15");
      if (!res.ok) return;
      const data = await res.json() as { notifications: Notification[]; unreadCount: number };
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll every 30s while tab is active
  useEffect(() => {
    if (status !== "authenticated") return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [status, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  const remove = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
  };

  if (status !== "authenticated") return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#2A3A4E] text-[#A3A3A3] transition-colors hover:border-[#2563EB] hover:text-white"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[9px] font-bold text-white leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-[#2A3A4E] bg-[#0A0E27] shadow-2xl overflow-hidden"
            role="dialog"
            aria-label="Notifications panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A3A4E]">
              <span className="text-sm font-semibold text-white">Notifications</span>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-[#2563EB] hover:text-[#00D9FF] transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <Link
                  href="/notifications"
                  className="text-xs text-[#6B7280] hover:text-white transition-colors"
                  onClick={() => setOpen(false)}
                >
                  See all
                </Link>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <p className="text-2xl mb-2">🔔</p>
                  <p className="text-sm text-[#6B7280]">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const inner = (
                    <div
                      className={`relative flex gap-3 px-4 py-3 transition-colors hover:bg-[#1A2332] group ${
                        !n.read ? "bg-[#0D1535]" : ""
                      }`}
                    >
                      {!n.read && (
                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                      )}
                      <span className="text-lg flex-shrink-0 mt-0.5" aria-hidden="true">
                        {TYPE_ICON[n.type] ?? "🔔"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white leading-snug">{n.title}</p>
                        <p className="text-xs text-[#6B7280] leading-snug mt-0.5 truncate">{n.body}</p>
                        <p className="text-[10px] text-[#4B5563] mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                      <button
                        onClick={(e) => remove(n.id, e)}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-[#4B5563] hover:text-[#EF4444] transition-all"
                        aria-label="Dismiss notification"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );

                  return (
                    <div key={n.id} onClick={() => !n.read && markRead(n.id)}>
                      {n.link ? (
                        <Link href={n.link} onClick={() => setOpen(false)}>
                          {inner}
                        </Link>
                      ) : inner}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
