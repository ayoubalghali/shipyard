#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Shipyard — Week 9-20 commit script
# Run this ONCE from the root of your Shipyard folder:
#
#   cd ~/path/to/Shipyard
#   bash scripts/commit-weeks-9-20.sh
#
# Each week is committed separately so your git log stays clean.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# Make sure we're in the repo root
if [ ! -f "package.json" ]; then
  echo "❌  Run this script from the Shipyard project root."
  exit 1
fi

echo "🚢  Committing Weeks 9-20..."

# ── Week 9: Reviews ─────────────────────────────────────────────────────────
git add \
  app/api/agents/\[id\]/reviews/ \
  components/reviews/ \
  app/agent/\[id\]/AgentDetailClient.tsx
git commit -m "feat: agent reviews & ratings system (Week 9)

- Add Review model to Prisma schema (rating, comment, unique user+agent)
- GET/POST/DELETE /api/agents/[id]/reviews with upsert + avg recalculation
- StarRating component — interactive/readonly, 3 sizes, hover state, ARIA
- AgentReviews panel — aggregate summary, distribution bars, write/edit form
- Wire AgentReviews into AgentDetailClient below PreviousRuns

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
echo "✅  Week 9 committed"

# ── Week 10: Favorites ───────────────────────────────────────────────────────
git add \
  app/api/agents/\[id\]/favorite/ \
  app/api/user/favorites/ \
  components/agents/FavoriteButton.tsx \
  app/favorites/ \
  components/agent-detail/AgentSidebar.tsx \
  components/layout/Header.tsx
git commit -m "feat: favorites & bookmarking system (Week 10)

- GET/POST /api/agents/[id]/favorite — optimistic toggle endpoint
- GET /api/user/favorites — paginated saved agents
- FavoriteButton — optimistic UI, real state on mount, auth redirect
- /favorites page — card grid with AnimatePresence, empty state CTA
- AgentSidebar — replaces local saved state with FavoriteButton
- Header — adds Explore + Favorites links to desktop & mobile nav

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
echo "✅  Week 10 committed"

# ── Week 11: Profile Settings ────────────────────────────────────────────────
git add \
  app/api/user/profile/ \
  app/settings/ \
  components/auth/UserMenu.tsx
git commit -m "feat: user profile settings page (Week 11)

- GET/PATCH /api/user/profile — stats + name/bio update
- /settings page — profile stats, avatar, edit form, earnings summary
- UserMenu — adds Favorites, Run History, Settings links

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
echo "✅  Week 11 committed"

# ── Week 12: Stripe Connect ──────────────────────────────────────────────────
git add \
  app/api/stripe/ \
  app/api/user/withdraw/ \
  components/dashboard/StripeSettings.tsx
git commit -m "feat: Stripe Connect Standard OAuth flow (Week 12)

- GET /api/stripe/connect — builds OAuth URL with base64url state
- GET /api/stripe/callback — exchanges code for stripe_user_id, persists to DB
- PUT /api/user/withdraw — real Stripe Transfers API call with fallback
- StripeSettings — real OAuth redirect via /api/stripe/connect

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
echo "✅  Week 12 committed"

# ── Week 13: Analytics ───────────────────────────────────────────────────────
git add \
  app/api/user/analytics/ \
  components/dashboard/AnalyticsPanel.tsx \
  app/creator/dashboard/page.tsx
git commit -m "feat: creator analytics charts (Week 13)

- GET /api/user/analytics?days=N — daily executions + earnings rollup
- AnalyticsPanel — day selector, summary cards, AreaCharts, BarChart
- Wire AnalyticsPanel into Creator Dashboard

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
echo "✅  Week 13 committed"

# ── Week 14: Search ──────────────────────────────────────────────────────────
git add \
  app/api/search/ \
  app/search/
git commit -m "feat: advanced search & discovery (Week 14)

- GET /api/search/suggestions?q= — fast typeahead (6 agent name matches)
- /search page — agent/creator tabs, category pills, sort dropdown
- AnimatePresence result grid with FavoriteButton + StarRating
- Header search form submits to /search?q=

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
echo "✅  Week 14 committed"

# ── Week 15: Agent Edit ──────────────────────────────────────────────────────
git add \
  app/agent/\[id\]/edit/
git commit -m "feat: agent edit & version management (Week 15)

- /agent/[id]/edit — pre-fills builder store, 4-step edit flow
- Verifies isOwner before allowing edit access
- Save as Draft or Update & Publish via PUT /api/agents/[id]
- AgentSidebar shows Edit Link button for owners

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
echo "✅  Week 15 committed"

# ── Week 16: Execution History ───────────────────────────────────────────────
git add \
  app/api/user/executions/ \
  app/history/
git commit -m "feat: execution history & re-run (Week 16)

- GET /api/user/executions — paginated history with agent name/category
- /history page — expandable accordion cards, input/output, copy button
- Status dot (green/red/amber), timeAgo + formatMs helpers, load more
- UserMenu — Run History link added

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
echo "✅  Week 16 committed"

# ── Week 17: PWA + Performance ───────────────────────────────────────────────
git add \
  public/manifest.json \
  public/sw.js \
  app/layout.tsx \
  app/api/agents/route.ts \
  app/api/agents/\[id\]/route.ts \
  app/api/search/suggestions/route.ts
git commit -m "feat: PWA support + API response caching (Week 17)

- Web app manifest with icons, shortcuts, theme colour
- Service worker: cache-first (static) / network-first (API/pages)
- Register SW + PWA meta tags in root layout
- Cache-Control headers on agents list, agent detail, suggestions

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
echo "✅  Week 17 committed"

# ── Week 18: Mobile + Accessibility ─────────────────────────────────────────
git add \
  components/layout/MobileBottomNav.tsx \
  app/globals.css \
  app/explore/page.tsx \
  app/search/page.tsx \
  app/favorites/page.tsx \
  app/history/page.tsx \
  app/settings/page.tsx
git commit -m "feat: mobile bottom nav + WCAG accessibility improvements (Week 18)

- MobileBottomNav — fixed tab bar (Explore/Create/Favorites/Profile)
- Skip-to-content link (WCAG 2.4.1), id=main-content on all major pages
- prefers-reduced-motion override (WCAG 2.3.3)
- Improved focus-visible ring, mobile bottom-nav clearance in global CSS

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
echo "✅  Week 18 committed"

# ── Week 19: Admin Panel ─────────────────────────────────────────────────────
git add \
  app/api/admin/ \
  app/admin/ \
  prisma/schema.prisma
git commit -m "feat: admin panel with platform stats, agent & user management (Week 19)

- is_admin on User, is_featured on Agent added to Prisma schema
- /api/admin/stats — platform-wide KPIs (users, agents, executions, earnings)
- /api/admin/agents — list all agents, publish/archive/feature toggles
- /api/admin/users — list users, verify/admin role toggles + search
- /admin, /admin/agents, /admin/users pages with table UIs

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
echo "✅  Week 19 committed"

# ── Week 20: Launch Prep ─────────────────────────────────────────────────────
git add \
  next.config.mjs \
  scripts/backup-db.sh \
  app/api/health/ \
  public/robots.txt \
  app/sitemap.ts \
  README.md
git commit -m "feat: launch prep & hardening (Week 20)

- Security headers: HSTS, X-Frame-Options, X-Content-Type-Options, etc.
- AVIF/WebP image formats, reactStrictMode enabled
- GET /api/health — liveness check with DB latency
- Dynamic sitemap.ts with DB-backed agent URLs
- robots.txt disallowing /admin, /api, private routes
- scripts/backup-db.sh — pg_dump with 30-day pruning
- Full README rewrite with setup, env vars, deployment docs

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
echo "✅  Week 20 committed"

echo ""
echo "🎉  All done! Weeks 9-20 committed."
echo ""
echo "Push to GitHub:"
echo "  git push origin main"
