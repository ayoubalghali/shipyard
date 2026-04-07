"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (status === "loading") {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-[#1A2332]" aria-label="Loading session" />
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => signIn()}
          className="rounded-[6px] border border-[#2A3A4E] px-3 py-1.5 text-sm font-medium text-[#00D9FF] transition-all hover:border-[#2563EB] hover:bg-[#0A0E27]"
        >
          Sign In
        </button>
        <Link
          href="/create"
          className="hidden rounded-[6px] bg-[#2563EB] px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-[#1D4ED8] sm:block"
        >
          Create Agent
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open user menu"
        className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]"
      >
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name ?? "User avatar"}
            width={32}
            height={32}
            className="rounded-full border border-[#2A3A4E]"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-sm font-semibold text-white">
            {session.user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 top-10 z-50 w-52 rounded-[8px] border border-[#2A3A4E] bg-[#0A0E27] py-1 shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
        >
          {/* User info */}
          <div className="border-b border-[#2A3A4E] px-4 py-3">
            <p className="truncate text-sm font-medium text-white">
              {session.user?.name ?? "User"}
            </p>
            <p className="truncate text-xs text-[#6B7280]">{session.user?.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/creator/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-[#A3A3A3] transition-colors hover:bg-[#1A2332] hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </Link>
            <Link
              href="/create"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-[#A3A3A3] transition-colors hover:bg-[#1A2332] hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Agent
            </Link>
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-[#A3A3A3] transition-colors hover:bg-[#1A2332] hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>
          </div>

          <div className="border-t border-[#2A3A4E] py-1">
            <button
              role="menuitem"
              onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#EF4444] transition-colors hover:bg-[#1A2332]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
