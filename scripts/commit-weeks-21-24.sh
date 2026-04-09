#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Shipyard — Week 21-24 commit script
# Run this ONCE from the root of your Shipyard folder:
#
#   cd ~/path/to/Shipyard
#   bash scripts/commit-weeks-21-24.sh
#
# Assumes Weeks 9-20 are already committed (run commit-weeks-9-20.sh first).
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

if [ ! -f "package.json" ]; then
  echo "❌  Run this script from the Shipyard project root."
  exit 1
fi

echo "🚢  Committing Weeks 21-24..."

# ── Week 21: Notifications ───────────────────────────────────────────────────
git add \
  prisma/schema.prisma \
  lib/notify.ts \
  app/api/notifications/ \
  app/api/agents/\[id\]/execute/route.ts \
  app/api/agents/\[id\]/reviews/route.ts \
  components/notifications/ \
  components/layout/Header.tsx \
  components/auth/UserMenu.tsx \
  app/notifications/
git commit -m "feat: in-app notifications system (Week 21)

- Add Notification model to Prisma schema (type, title, body, link, read)
- lib/notify.ts — server-side factory with helpers (review/earning/execution)
- GET/PATCH/DELETE /api/notifications — paginated, mark-read, dismiss
- NotificationBell — live badge, 30s polling, dropdown with dismiss-on-hover
- /notifications page — filter pills, AnimatePresence, load more
- Fire notifications on execution (earning + run) and new review

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
echo "✅  Week 21 committed"

# ── Week 22: API Keys ────────────────────────────────────────────────────────
git add \
  lib/apiKeyAuth.ts \
  app/api/user/api-keys/ \
  app/api/agents/\[id\]/execute/route.ts \
  components/settings/ \
  app/settings/page.tsx
git commit -m "feat: agent API keys for programmatic access (Week 22)

- ApiKey model in Prisma schema (SHA-256 hashed, prefix shown in UI)
- GET/POST/DELETE /api/user/api-keys — list, create (one-time reveal), revoke
- lib/apiKeyAuth.ts — Bearer token validation + last_used_at tracking
- Execute route now accepts Bearer sk_... alongside session auth
- ApiKeysPanel component — create, expiry, revoke, curl usage example

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
echo "✅  Week 22 committed"

# ── Week 23: Embed Widget ────────────────────────────────────────────────────
git add \
  app/embed/ \
  components/agent-detail/EmbedPanel.tsx \
  components/agent-detail/AgentSidebar.tsx
git commit -m "feat: agent embed widget (iframe + script) (Week 23)

- /embed/[id] — standalone embeddable page (noindex, no chrome)
- EmbedClient — streams output via SSE, postMessage API for host pages
- EmbedPanel — collapsible in AgentSidebar, height control + copy snippets
- Events: shipyard:run_start, shipyard:run_complete, shipyard:run_error

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
echo "✅  Week 23 committed"

# ── Week 24: Leaderboards + Clone ───────────────────────────────────────────
git add \
  app/api/leaderboard/ \
  app/api/agents/\[id\]/clone/ \
  app/leaderboard/ \
  components/agent-detail/AgentSidebar.tsx \
  components/layout/Header.tsx
git commit -m "feat: leaderboards + agent cloning (Week 24)

- GET /api/leaderboard?type=agents|creators&period=week|month|all
- /leaderboard — medal ranks, tab toggle, period filter
- POST /api/agents/[id]/clone — forks agent as private draft
- Clone button in AgentSidebar, notifies original creator
- Leaderboard link added to Header nav

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
echo "✅  Week 24 committed"

echo ""
echo "🎉  Weeks 21-24 committed."
echo ""
echo "Push to GitHub:"
echo "  git push origin main"
