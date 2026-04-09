"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const NAV_ITEMS = [
  {
    href: "/explore",
    label: "Explore",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
      </svg>
    ),
  },
  {
    href: "/create",
    label: "Create",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: "/favorites",
    label: "Favorites",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Profile",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { status } = useSession();

  // Hide on auth pages and during agent execution
  if (pathname.startsWith("/login") || pathname.startsWith("/auth")) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0A0E27] border-t border-[#2A3A4E] flex items-stretch"
      aria-label="Mobile navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/explore"
            ? pathname === "/" || pathname.startsWith("/explore")
            : pathname.startsWith(item.href);

        const requiresAuth = item.href === "/favorites" || item.href === "/settings";
        const href = requiresAuth && status === "unauthenticated" ? "/login" : item.href;

        return (
          <Link
            key={item.href}
            href={href}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors min-h-[56px] ${
              isActive
                ? "text-[#2563EB]"
                : "text-[#6B7280] hover:text-[#A3A3A3] active:text-white"
            }`}
          >
            <span className={isActive ? "text-[#2563EB]" : ""}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
