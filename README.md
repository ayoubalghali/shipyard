# Shipyard — No-Code AI Agent Marketplace

> Build, share, and monetize AI agents without writing a single line of code.

Built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Prisma + PostgreSQL (Supabase)**, **NextAuth.js**, and **Stripe Connect**.

---

## Features

- **Agent Builder** — 4-step visual wizard (info → parameters → prompt → preview)
- **Marketplace** — Browse, search, filter, and favorite agents
- **Run Agents** — Server-Sent Events streaming execution with Ollama or Claude
- **Creator Dashboard** — Earnings, analytics charts, agent management
- **Stripe Connect** — Payouts to creators via Stripe Standard Connect
- **Reviews & Ratings** — Star ratings with distribution bars
- **Execution History** — Paginated run history with input/output viewer
- **Admin Panel** — Platform stats, agent moderation, user management
- **PWA** — Installable with offline support via service worker
- **WCAG Accessible** — Skip links, aria-labels, reduced-motion support

---

## Quick Start

```bash
# 1. Install dependencies (also runs prisma generate)
npm install

# 2. Copy environment template
cp .env.example .env
# Fill in: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID,
#          GOOGLE_CLIENT_SECRET, STRIPE_SECRET_KEY, STRIPE_CONNECT_CLIENT_ID,
#          ANTHROPIC_API_KEY (optional)

# 3. Push schema to your database
npx prisma db push

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes* | PostgreSQL connection string (Supabase) |
| `NEXTAUTH_SECRET` | Yes | Random secret for NextAuth JWT signing |
| `NEXTAUTH_URL` | Yes | Your app URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth app client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth app client secret |
| `STRIPE_SECRET_KEY` | Optional | Stripe secret key for real payouts |
| `STRIPE_CONNECT_CLIENT_ID` | Optional | Stripe Connect platform client ID |
| `ANTHROPIC_API_KEY` | Optional | Enable Claude models for execution |
| `ADMIN_EMAIL` | Optional | Email of bootstrap admin (no-DB fallback) |

*Without `DATABASE_URL`, the app runs in mock-data mode — fully functional for demos.

---

## Deployment (Railway / Render)

```bash
# Build
npm run build

# Start production server
npm start

# Database backup
./scripts/backup-db.sh
```

The app outputs a [standalone Next.js build](https://nextjs.org/docs/pages/api-reference/next-config-js/output) suitable for Docker or Railway.

Health check endpoint: `GET /api/health`

---

## Admin Access

1. Sign in with Google.
2. In Supabase, set `is_admin = true` on your user row, **or** set `ADMIN_EMAIL=your@email.com` env var.
3. Navigate to `/admin`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Database ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | NextAuth.js v4 (Google OAuth) |
| Payments | Stripe Connect Standard |
| AI | Ollama (local) + Anthropic Claude |
| Animation | Framer Motion |
| Charts | Recharts |
| State | Zustand |
| PWA | Web App Manifest + Service Worker |

---

## Project Structure

```
app/
  agent/[id]/       # Agent detail + execution
  admin/            # Admin panel (stats, agents, users)
  api/              # All API routes
  create/           # Agent builder
  creator/dashboard # Creator dashboard
  explore/          # Marketplace
  favorites/        # Saved agents
  history/          # Run history
  search/           # Search results
  settings/         # User profile & Stripe connect
components/
  agent-detail/     # Execution output, sidebar, reviews
  auth/             # UserMenu, SessionProvider
  builder/          # 4-step agent builder steps
  dashboard/        # Creator dashboard widgets
  layout/           # Header, Footer, MobileBottomNav
  reviews/          # StarRating, AgentReviews
lib/
  auth.ts           # NextAuth config
  db.ts             # Prisma client with DB_AVAILABLE guard
  mockData.ts       # Mock agents for demo mode
  types.ts          # Shared TypeScript types
prisma/
  schema.prisma     # Database schema
scripts/
  backup-db.sh      # Database backup utility
store/
  agentStore.ts     # Zustand store for explore/search state
  builderStore.ts   # Zustand store for agent builder
```
