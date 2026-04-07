import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[#2A3A4E] bg-[#0A0E27]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB]">
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M2 14L9 4L16 14H2Z" fill="white" strokeWidth="1.5" strokeLinejoin="round" />
                  <circle cx="9" cy="14" r="2" fill="#00D9FF" />
                </svg>
              </div>
              <span className="text-base font-semibold text-white">Shipyard</span>
            </Link>
            <p className="mt-3 text-sm text-[#A3A3A3] leading-relaxed">
              The no-code platform for building, sharing, and monetizing AI agents.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Product</h4>
            <ul className="space-y-2">
              {[
                { label: "Explore Agents", href: "/" },
                { label: "Create Agent", href: "/create" },
                { label: "Pricing", href: "/pricing" },
                { label: "Changelog", href: "/changelog" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#A3A3A3] transition-colors hover:text-[#00D9FF]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Creators */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Creators</h4>
            <ul className="space-y-2">
              {[
                { label: "Creator Dashboard", href: "/creator/dashboard" },
                { label: "Monetization", href: "/creators/monetize" },
                { label: "Guidelines", href: "/creators/guidelines" },
                { label: "Community", href: "/community" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#A3A3A3] transition-colors hover:text-[#00D9FF]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Company</h4>
            <ul className="space-y-2">
              {[
                { label: "About", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#A3A3A3] transition-colors hover:text-[#00D9FF]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#2A3A4E] pt-8 sm:flex-row">
          <p className="text-xs text-[#6B7280]">
            © {new Date().getFullYear()} Shipyard. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#6B7280]">Built with</span>
            <span className="text-xs text-[#00D9FF]">Claude AI</span>
            <span className="text-xs text-[#6B7280]">&</span>
            <span className="text-xs text-[#00D9FF]">Ollama</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
