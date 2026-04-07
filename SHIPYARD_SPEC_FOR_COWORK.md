# SHIPYARD: Complete Project Specification for Claude Cowork
## Autonomous Build Document (No Back-and-Forth Needed)

**This document is your "constitution" for Shipyard. Cowork follows this. You review milestones. That's it.**

---

## CRITICAL: Read This First

**How to use this document with Cowork**:

1. Create a **Cowork Project** named "Shipyard"
2. Upload this entire document as **Project Instructions**
3. Point Cowork to your GitHub repo
4. Tell Cowork: "Follow the Shipyard specification exactly. Here's the complete spec. Build feature by feature, following this document. Commit after each feature. I'll review every Saturday."
5. **Cowork builds autonomously.** You only review/approve at checkpoints.

**This means**:
- ✅ Cowork makes decisions based on the spec (no asking you every step)
- ✅ Cowork commits code automatically
- ✅ Cowork follows design system exactly
- ✅ You review once per week (not daily)
- ✅ Minimum back-and-forth

---

# SHIPYARD SPECIFICATION (Cowork's Constitution)

## SECTION 1: PROJECT OVERVIEW

**Project Name**: Shipyard  
**Creator**: Ayoub (Non-technical community builder)  
**Vision**: No-code agent builder for non-technical users to create, share, and monetize AI agents  
**Quality Target**: Perplexity.ai level (extremely high quality from day 1)  
**Timeline**: 20 weeks  
**Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, Zustand, PostgreSQL, Prisma, Claude API, Ollama  

---

## SECTION 2: DESIGN SYSTEM (LOCKED - DO NOT DEVIATE)

### Color Palette
```
Dark Backgrounds:
- Pure Black: #000000 (page backgrounds)
- Dark Navy: #0A0E27 (card surfaces)
- Elevated: #1A2332 (hover states, modals)
- Interactive: #2A3A4E (borders, hover effects)

Brand Colors:
- Primary Blue: #2563EB (buttons, CTAs, active states)
- Accent Cyan: #00D9FF (highlights, special elements)

Status Colors:
- Success: #10B981 (green for success)
- Warning: #F59E0B (amber for warnings)
- Error: #EF4444 (red for errors)

Text Colors:
- Primary: #FFFFFF (headings, important text)
- Secondary: #A3A3A3 (body text, secondary info)
- Tertiary: #6B7280 (dimmed, less important)
- Disabled: #4B5563 (disabled states)

RULE: Never use light backgrounds. Dark theme only.
RULE: Cyan (#00D9FF) for "special" things (hover, active, highlights)
```

### Typography
```
Font Family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
Mono Font: 'Fira Code', 'Courier New', monospace

Sizes:
- H1: 32px, 600 weight, 1.2 line-height
- H2: 24px, 600 weight, 1.3 line-height
- H3: 18px, 600 weight, 1.4 line-height
- Body: 14px, 400 weight, 1.6 line-height
- Caption: 12px, 400 weight, 1.5 line-height
- Code: 12px, mono font

RULE: Use semibold for headings, regular for body.
RULE: Line-height never less than 1.2.
```

### Spacing System (4px Grid)
```
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
2xl: 32px
3xl: 48px
4xl: 64px

RULE: All spacing must be multiple of 4px.
RULE: Cards: 16px padding
RULE: Sections: 24px padding
RULE: Page margins: 32px desktop, 16px mobile
```

### Component Specs (EXACT)

**Buttons**:
```
Primary Button:
- Background: #2563EB
- Hover: #1D4ED8
- Active: #1E40AF
- Padding: 10px 16px
- Border-radius: 6px
- Font: 14px, 500 weight
- Transition: all 150ms ease
- Cursor: pointer

Secondary Button:
- Background: transparent
- Border: 1px solid #2A3A4E
- Text: #00D9FF
- Hover: background #0A0E27, border #2563EB
- Otherwise: same as primary

Ghost Button:
- Same as secondary but no border
```

**Cards**:
```
- Background: #0A0E27
- Border: 1px solid #2A3A4E
- Border-radius: 8px
- Padding: 16px
- Box-shadow: none (use border only)
- Hover shadow: 0 4px 12px rgba(0, 0, 0, 0.3)
- Transition: all 150ms ease
```

**Inputs**:
```
- Background: #1A2332
- Border: 1px solid #2A3A4E
- Focus: border #00D9FF, box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.1)
- Text color: #FFFFFF
- Placeholder: #6B7280
- Padding: 8px 12px
- Border-radius: 6px
- Font: 14px
```

**Links**:
```
- Color: #00D9FF
- Hover: underline
- Active: #0099CC (darker cyan)
```

### Animations
```
Page transition: fade 150ms ease-in-out
Component enter: slide-up + fade 200ms cubic-bezier(0.4, 0, 0.2, 1)
Hover effects: 150ms ease
Micro-interactions: 100-200ms
Loading spinners: continuous rotation, 1s per rotation

RULE: All animations must be hardware-accelerated (use transform, opacity)
RULE: No jank. Test on real device.
RULE: 60fps minimum.
```

---

## SECTION 3: FEATURE SPECIFICATIONS

### Feature 1: Homepage (Week 1)
**Purpose**: Users see featured agents, can search, browse categories

**Layout**:
```
Header:
├─ Logo (clickable → home)
├─ Search bar (centered)
├─ User menu / Login button (right)

Content:
├─ Hero section: "Create & Share AI Agents"
│  └─ [Create Agent] button (primary, cyan hover)
├─ Featured Agents (6 agents, 3 columns desktop)
│  └─ AgentCard component (see below)
├─ Trending This Week (carousel of 6 agents)
├─ Categories Grid (Workflows, Code, Visual, Apps, etc)
│  └─ Each category is clickable tile
├─ Browse All Agents (infinite scroll or pagination)
│  └─ Sort: Trending, Most Used, Highest Rated, Newest
│  └─ Filter by category (sidebar on desktop, modal on mobile)
└─ Footer

Mobile: Sidebar collapses to hamburger, all stacks vertically
```

**AgentCard Component**:
```
Props:
- agent: { id, name, description, category, rating, usageCount, createdAt }
- creator: { id, name, avatar, isVerified }
- onUseClick: () => void

Display:
┌─────────────────────────┐
│ [Avatar 32px] Name      │ (bold)
│ @creator_name           │ (gray, 12px)
├─────────────────────────┤
│ ⭐ 4.8 · Used 234x    │ (12px, gray)
│                         │
│ Agent description here  │ (truncate 2 lines)
├─────────────────────────┤
│ [Use Agent →]           │ (primary button, full width)
└─────────────────────────┘

Hover: Border #2563EB, shadow appears, cyan glow
Responsive: 1 column mobile, 2 tablet, 3+ desktop
```

**Requirements**:
- [ ] Perplexity-level design
- [ ] Dark theme only
- [ ] TypeScript strict
- [ ] Responsive (tested 320px, 768px, 1440px)
- [ ] No external API calls (hardcoded featured agents ok for MVP)
- [ ] Mobile hamburger menu
- [ ] Search bar works (client-side filtering for MVP)
- [ ] 60fps animations
- [ ] Lighthouse score 90+

**Acceptance Criteria**:
- Homepage loads in <2 seconds
- All buttons clickable
- Search filters agents
- Clicking agent card navigates to detail page
- Mobile menu toggle works
- No console errors

---

### Feature 2: Agent Detail & Execution (Week 2)
**Purpose**: User sees agent details, runs it, sees output

**URL**: `/agent/[id]`

**Layout**:
```
Left Sidebar (30%):
├─ Agent icon/image
├─ Agent name (H2)
├─ Creator: @name (clickable)
├─ ⭐ Rating
├─ Used X times
├─ Category badge
├─ Description (full text)
├─ [Share] [Save to List] buttons
└─ Related Agents (carousel)

Main Content (70%):
├─ Input Parameters Section:
│  ├─ Dynamic form fields (based on agent.parameters)
│  ├─ Field types: text, number, select, textarea, file
│  ├─ Each field has label, placeholder, help text
│  └─ [Model Selection] radio buttons (Claude vs Ollama)
├─ [Advanced Options] (collapse):
│  ├─ Temperature slider (0-1)
│  ├─ Max tokens input (100-4000)
│  └─ System prompt override (textarea)
├─ [Run Agent] button (primary, large, full width)
└─ Output Section:
   ├─ Loading state (spinner + "Running...")
   ├─ Real-time streaming output (markdown formatted)
   ├─ Execution time (bottom right)
   ├─ [Copy Output] [Save Result] [Share] buttons
   └─ Previous Runs (dropdown, shows last 5 executions)

Mobile: Sidebar → top section, main content full width
```

**Execution Flow**:
1. User fills input fields
2. Clicks [Run Agent]
3. POST to `/api/agents/[id]/execute` with parameters
4. Server streams response as Server-Sent Events
5. Output appears real-time in UI
6. Save execution to database
7. Track earnings for creator

**Requirements**:
- [ ] Real-time streaming (no buffering)
- [ ] Error handling (show error message if execution fails)
- [ ] Loading state with spinner
- [ ] Model selection (Claude or Ollama, default Ollama)
- [ ] Parameter validation (client-side)
- [ ] Markdown rendering in output
- [ ] Copy to clipboard (one-click)
- [ ] Previous runs history
- [ ] Responsive design
- [ ] TypeScript strict

**Acceptance Criteria**:
- Agent executes in <5 seconds (Ollama), <3 seconds (Claude)
- Output streams in real-time (no 5-second wait)
- Can copy output
- Previous runs visible
- Error handling works
- Mobile touch-friendly

---

### Feature 3: No-Code Agent Builder (Week 3)
**Purpose**: Non-technical users create agents without coding

**URL**: `/create`

**Layout**:
```
Multi-step form (no page reload):

Step 1: Basic Info
├─ Agent Name (text input, required)
├─ Description (textarea, 500 chars max)
├─ Category (dropdown)
└─ Tags (multi-select, 5 max)

Step 2: Prompt Editor
├─ Prompt (large textarea with syntax highlighting)
├─ Help text: "What should the agent do? Be specific."
├─ [Show Preview] button (runs agent with sample input)
└─ Preview output (real-time as you type, max 2 seconds debounce)

Step 3: Parameters
├─ Add Input Parameter (button)
│  └─ For each parameter:
│     ├─ Parameter name
│     ├─ Type (text, number, select, file)
│     ├─ Required toggle
│     ├─ Default value
│     └─ Help text
├─ Remove parameter button
└─ Preview form (shows how it will look)

Step 4: Settings
├─ Model selection (Claude vs Ollama)
├─ Temperature slider
├─ Max tokens input
├─ System prompt override (optional)
└─ Visibility (Public/Private)

Step 5: Review & Publish
├─ Preview of agent card
├─ Summary of all settings
├─ [Publish Agent] button (primary)
├─ [Save as Draft] button (secondary)
└─ [Cancel] button (ghost)

Mobile: Full-width form, one step per screen
```

**Real-time Preview**:
- As user types prompt, runs live test
- Shows actual output
- If error: show error message
- Max execution time: 2 seconds (show timeout message)

**Requirements**:
- [ ] Step-by-step form (no page reload)
- [ ] Real-time preview
- [ ] Input validation
- [ ] Syntax highlighting in prompt editor
- [ ] Ollama integration (run preview locally)
- [ ] Error handling (show error, not crash)
- [ ] Save as draft (to localStorage first)
- [ ] Publish creates database record
- [ ] Redirect to agent page after publish
- [ ] TypeScript strict
- [ ] Responsive

**Acceptance Criteria**:
- Non-technical user can create agent in 10 minutes
- Preview works in <2 seconds
- Published agent immediately visible on marketplace
- Draft saved to localStorage
- All inputs validated
- No crashes

---

### Feature 4: Creator Dashboard (Week 4)
**Purpose**: Creators see earnings, manage agents

**URL**: `/creator/dashboard`

**Layout**:
```
Header:
├─ Welcome, [Creator Name]!
├─ This Month's Earnings: $X,XXX.XX (big number, cyan)
├─ Available to Withdraw: $XXX.XX (with [Withdraw] button)
└─ Last Update: Just now

Quick Stats (3 cards):
├─ Agents Created: 5
├─ Total Uses: 1,234
└─ Average Rating: 4.8 ⭐

My Agents (table/list):
├─ Columns: Agent Name | Uses | Rating | Earnings | Actions
├─ Sorting: clicks sort headers
├─ Actions: [Edit] [View] [Archive]
└─ [Create New Agent] button (primary)

Recent Earnings (table):
├─ Columns: Date | Agent Name | Uses | Amount | Status
├─ Status: Pending / Paid
├─ Sortable by date
└─ Pagination: 20 per page

Agent Analytics (expandable):
├─ For each agent:
│  ├─ Total earnings
│  ├─ Uses over time (chart)
│  ├─ Rating trend
│  └─ Most common inputs

Settings:
├─ Stripe account status
├─ Withdrawal history
├─ Tax info (W-9, if US)
└─ Profile settings

Mobile: Stack vertically, cards full-width
```

**Requirements**:
- [ ] Fetch from `/api/user/earnings`
- [ ] Real-time earnings updates
- [ ] Withdrawal to Stripe (button flow)
- [ ] Agent analytics (charts with recharts)
- [ ] Sortable tables
- [ ] Edit agent button (goes to builder)
- [ ] Archive agent (soft delete, can unarchive)
- [ ] TypeScript strict
- [ ] Responsive
- [ ] Stripe integration ready (button doesn't process yet, just flow)

**Acceptance Criteria**:
- Dashboard loads in <2 seconds
- Earnings display correctly
- Can edit agent
- Can archive agent
- Tables sortable
- Charts render
- No console errors

---

### Feature 5: Authentication (Week 2-3, parallelize)
**Purpose**: Users can login/logout

**Flow**:
1. Login page: GitHub or Google OAuth
2. NextAuth.js handles session
3. Redirect to dashboard if logged in
4. Logout button in header

**Requirements**:
- [ ] GitHub OAuth provider
- [ ] Google OAuth provider
- [ ] Session persistence (localStorage + server)
- [ ] Protected routes (require auth)
- [ ] User profile in database
- [ ] Logout clears session
- [ ] TypeScript strict

**Acceptance Criteria**:
- Can login with GitHub
- Can login with Google
- Session persists (refresh page, still logged in)
- Can logout
- Protected routes redirect to login
- User profile created on first login

---

## SECTION 4: DATABASE SCHEMA

### Prisma Schema
```prisma
// User (account holder - creator or regular user)
model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  name                  String
  avatar_url            String?
  bio                   String?
  
  // Creator info
  stripe_account_id     String?   @unique
  total_earned          Float     @default(0)
  withdrawn             Float     @default(0)
  is_verified           Boolean   @default(false)
  verification_date     DateTime?
  
  // Relations
  agents                Agent[]
  executions            Execution[]
  earnings              Earning[]
  favorites             Favorite[]
  
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
}

// Agent (AI agent/workflow)
model Agent {
  id                    String    @id @default(cuid())
  name                  String
  description           String
  category              String    // e.g., "Workflows", "Code", "Visual", "Apps"
  tags                  String[]  // array of tags
  
  // Content
  prompt                String    @db.Text  // the prompt/instruction
  parameters            Json      // array of parameters definition
  system_prompt         String?   @db.Text // optional override
  
  // Settings
  default_model         String    @default("ollama")  // "claude" or "ollama"
  temperature           Float     @default(0.7)
  max_tokens            Int       @default(2000)
  
  // Stats
  rating                Float     @default(0)
  usage_count           Int       @default(0)
  view_count            Int       @default(0)
  
  // Visibility
  is_public             Boolean   @default(true)
  status                String    @default("published")  // published, draft, archived
  
  // Relations
  creator_id            String
  creator               User      @relation(fields: [creator_id], references: [id], onDelete: Cascade)
  executions            Execution[]
  earnings              Earning[]
  favorites             Favorite[]
  
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  
  @@index([creator_id])
  @@index([category])
  @@fulltext([name, description, prompt])  // for search
}

// Execution (agent run/output)
model Execution {
  id                    String    @id @default(cuid())
  
  // Relations
  agent_id              String
  agent                 Agent     @relation(fields: [agent_id], references: [id], onDelete: Cascade)
  user_id               String?   // null if anonymous
  user                  User?     @relation(fields: [user_id], references: [id], onDelete: SetNull)
  
  // Input/Output
  input_data            Json      // { parameter_name: value, ... }
  output                String    @db.Text
  
  // Execution info
  model_used            String    // "claude" or "ollama"
  tokens_input          Int
  tokens_output         Int
  execution_time_ms     Int       // milliseconds
  
  // Status
  status                String    @default("success")  // success, error, timeout
  error_message         String?
  
  created_at            DateTime  @default(now())
  
  @@index([agent_id])
  @@index([user_id])
}

// Earning (creator earnings per execution)
model Earning {
  id                    String    @id @default(cuid())
  
  // Relations
  creator_id            String
  creator               User      @relation(fields: [creator_id], references: [id], onDelete: Cascade)
  agent_id              String
  agent                 Agent     @relation(fields: [agent_id], references: [id], onDelete: Cascade)
  execution_id          String
  
  // Amount
  amount                Float     // creator share (70%)
  platform_fee          Float     // platform share (30%)
  
  // Status
  status                String    @default("pending")  // pending, paid
  paid_at               DateTime?
  
  created_at            DateTime  @default(now())
  
  @@index([creator_id])
  @@index([agent_id])
}

// Favorite (user favorites)
model Favorite {
  id                    String    @id @default(cuid())
  
  user_id               String
  user                  User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  agent_id              String
  agent                 Agent     @relation(fields: [agent_id], references: [id], onDelete: Cascade)
  
  created_at            DateTime  @default(now())
  
  @@unique([user_id, agent_id])
  @@index([user_id])
}
```

---

## SECTION 5: API ENDPOINTS

### Agent Endpoints

**GET /api/agents**
```
Query Params:
- search: string (search in name, description)
- category: string (filter by category)
- sort: "trending" | "most_used" | "highest_rated" | "newest"
- limit: number (default 20, max 100)
- offset: number (default 0)

Response:
{
  agents: [Agent],
  total: number,
  hasMore: boolean
}

Status: 200 OK
Errors: 400 Bad Request
```

**POST /api/agents**
```
Auth: Required (user must be logged in)
Body:
{
  name: string,
  description: string,
  category: string,
  tags: string[],
  prompt: string,
  parameters: Json,
  default_model: "claude" | "ollama",
  temperature: number,
  max_tokens: number
}

Response:
{
  agent: Agent,
  message: "Agent created successfully"
}

Status: 201 Created
Errors: 400 Bad Request, 401 Unauthorized
```

**GET /api/agents/[id]**
```
Response:
{
  agent: Agent,
  creator: User,
  isOwner: boolean (if authenticated)
}

Status: 200 OK
Errors: 404 Not Found
```

**PUT /api/agents/[id]**
```
Auth: Required (must be owner)
Body: (any fields to update)
{
  name?: string,
  description?: string,
  prompt?: string,
  parameters?: Json,
  temperature?: number,
  max_tokens?: number,
  is_public?: boolean
}

Response:
{
  agent: Agent,
  message: "Agent updated successfully"
}

Status: 200 OK
Errors: 400 Bad Request, 401 Unauthorized, 404 Not Found
```

**DELETE /api/agents/[id]**
```
Auth: Required (must be owner)
Soft delete: sets status to "archived"

Response:
{
  message: "Agent archived successfully"
}

Status: 200 OK
Errors: 401 Unauthorized, 404 Not Found
```

**POST /api/agents/[id]/execute**
```
Auth: Optional (track user for analytics if provided)
Body:
{
  input_data: Json,  // { param_name: value, ... }
  model: "claude" | "ollama"
}

Response: Server-Sent Events stream
```
data: {type: "start", execution_id: "..."}
data: {type: "content", content: "..."}
data: {type: "content", content: "..."}
data: {type: "end", tokens_input: 123, tokens_output: 456}
```

Status: 200 OK (streaming)
Errors: 400 Bad Request, 404 Not Found, 500 Internal Server Error
```

**GET /api/agents/[id]/executions**
```
Auth: Optional (if authenticated, show user's own executions)
Query Params:
- limit: number (default 20)
- offset: number (default 0)

Response:
{
  executions: [Execution],
  total: number,
  hasMore: boolean
}

Status: 200 OK
```

### User Endpoints

**GET /api/user/earnings**
```
Auth: Required
Response:
{
  user: User,
  this_month: number,
  available_to_withdraw: number,
  total_all_time: number,
  agents: [
    {
      agent_id: string,
      agent_name: string,
      earnings: number,
      uses: number
    }
  ]
}

Status: 200 OK
Errors: 401 Unauthorized
```

**POST /api/user/withdraw**
```
Auth: Required
Body:
{
  amount: number,
  stripe_account_id: string
}

Response:
{
  payout_id: string,
  amount: number,
  status: "pending",
  message: "Withdrawal initiated"
}

Status: 200 OK
Errors: 400 Bad Request, 401 Unauthorized
```

**GET /api/search**
```
Query Params:
- q: string (search query)
- type: "agents" | "creators" (default agents)
- limit: number (default 20)

Response:
{
  results: [Agent | User],
  total: number
}

Status: 200 OK
```

---

## SECTION 6: TECHNOLOGY DECISIONS (LOCKED)

**Frontend**:
- Next.js 14 with App Router (not Pages Router)
- TypeScript strict mode (tsconfig { strict: true })
- React 18 with Server Components where possible
- Tailwind CSS (no CSS-in-JS, no styled-components)
- Framer Motion for animations (not CSS animations alone)
- Zustand for state (not Redux, not Context)
- Recharts for charts (not D3, not Chart.js)

**Backend**:
- Next.js API Routes (in /app/api)
- Prisma ORM (not raw SQL, not TypeORM)
- PostgreSQL (not MongoDB, not SQLite for production)
- NextAuth.js for authentication (not JWT manual)

**LLM Integration**:
- Claude API via @anthropic-ai/sdk (for paid users)
- Ollama for local inference (free, on-device)
- Server-Sent Events for streaming

**Deployment**:
- Railway for database, backend, frontend (simplest)
- OR Vercel for frontend + separate DB
- OR AWS (if you want more control)
- Docker for containerization
- GitHub Actions for CI/CD

**NOT Allowed**:
- ❌ No Vue, Svelte, Angular
- ❌ No CSS-in-JS (styled-components, emotion)
- ❌ No Redux
- ❌ No MongoDB for production
- ❌ No Light Mode
- ❌ No DevOps over-engineering (keep simple)

---

## SECTION 7: COWORK AUTONOMOUS WORKFLOW

**How Cowork Should Work**:

1. **Cowork reads this entire spec** (you point to it)
2. **Cowork breaks it into weekly chunks**:
   - Week 1: Feature 1 (Homepage)
   - Week 2: Features 2 + 3 (Auth + Agent Detail)
   - Week 3: Feature 4 (Agent Builder)
   - Etc.
3. **Cowork generates code** for each feature
4. **Cowork commits to GitHub** after each feature with message:
   ```
   feat: [Feature Name] (Week X)
   
   - Generated UI components
   - Added API routes
   - Integrated LLM
   - Ready for testing
   ```
5. **Cowork continues to next feature** without waiting for your approval
6. **You review on Saturdays**:
   - Test the week's features locally
   - If good: approve, move forward
   - If issues: log them, Cowork fixes next
7. **Cowork automatically fixes bugs** if you describe them clearly

---

## SECTION 8: CODE QUALITY STANDARDS

**Every file must follow**:

### TypeScript
```typescript
// ✅ GOOD
interface AgentProps {
  id: string;
  name: string;
  rating: number;
}

export function AgentCard({ id, name, rating }: AgentProps) {
  return <div>{name}</div>;
}

// ❌ BAD
function agent(props) {
  return <div>{props.name}</div>;
}
```

### Imports
```typescript
// ✅ Absolute imports
import { Button } from "@/components/ui/button";
import { useAgents } from "@/lib/hooks/useAgents";

// ❌ Relative imports (unless within same folder)
import Button from "../../../components/ui/button";
```

### Error Handling
```typescript
// ✅ Always handle errors
try {
  const response = await fetch("/api/agents");
  if (!response.ok) throw new Error("Failed to fetch");
  return response.json();
} catch (error) {
  console.error("Fetch error:", error);
  return [];
}

// ❌ Silent failures
async function getAgents() {
  const response = await fetch("/api/agents");
  return response.json();
}
```

### Styling
```jsx
// ✅ Tailwind only
<button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
  Click me
</button>

// ❌ CSS modules or styled-components
import styles from "./button.module.css";
<button className={styles.button}>Click me</button>
```

### Comments
```typescript
// ✅ Only explain WHY, not WHAT
// Retry failed requests exponentially to handle temporary outages
const delay = Math.pow(2, attempt) * 1000;

// ❌ Comments that explain code
// Add 2 to the result
const result = number + 2;
```

---

## SECTION 9: TESTING & QA

**Cowork MUST test every feature before commit**:

1. **Manual Testing** (required):
   - Feature works as spec says
   - No console errors
   - Mobile responsive
   - Dark theme applied
   - All buttons clickable
   - Forms validate
   - API calls return correct data
   - Error states show correctly

2. **Responsive Testing**:
   - Test at 320px (mobile)
   - Test at 768px (tablet)
   - Test at 1440px (desktop)

3. **Performance**:
   - Page load < 2 seconds
   - No jank (60fps)
   - No layout shift

4. **Accessibility**:
   - WCAG 2.1 AA minimum
   - Proper ARIA labels
   - Keyboard navigation works
   - Color contrast ≥ 4.5:1

**If test fails**: Don't commit. Fix first. Then test again.

---

## SECTION 10: WEEKLY CHECKPOINTS

**Every Saturday, you review**:

- [ ] Features of that week completed
- [ ] Code quality good
- [ ] No console errors
- [ ] Responsive design working
- [ ] Dark theme applied correctly
- [ ] TypeScript strict (no `any` types)
- [ ] Commits are clean with good messages
- [ ] Ready to merge to main

**Decision**:
- ✅ **APPROVE**: Features look good, Cowork continues next week
- 🔧 **NEEDS FIXES**: Log specific issues, Cowork fixes them next
- 🛑 **HOLD**: Architecture issue found, discuss with Cowork

---

## SECTION 11: LAUNCH CRITERIA (Week 20)

**Shipyard is ready to launch when**:

- [ ] All 5 features complete and tested
- [ ] Homepage loads in < 2 seconds
- [ ] Can create agent (no coding needed)
- [ ] Can run agent (Ollama or Claude)
- [ ] Creator dashboard shows earnings
- [ ] No critical bugs
- [ ] Mobile responsive
- [ ] Lighthouse 90+
- [ ] Zero console errors
- [ ] All links work
- [ ] Database backups automated
- [ ] Monitoring/logging set up
- [ ] Error tracking (Sentry) active

---

## SECTION 12: COWORK INSTRUCTIONS (START HERE)

**Give Cowork this exact prompt**:

```
You are building Shipyard with me (Ayoub).

I've given you a complete specification document.
Follow it exactly. Don't ask me questions about architecture or design—it's all in the spec.

Your job:
1. Read the spec (Sections 1-11)
2. Build Feature 1 (Homepage) first
3. Test it (manual testing, responsive, dark theme)
4. Commit with message "feat: Homepage (Week 1)"
5. Move to Feature 2
6. Repeat until Week 20

You can:
- Generate code based on spec
- Make technical decisions (e.g., which library)
- Fix bugs you encounter
- Commit to GitHub
- Write tests

You CANNOT:
- Change the design system (colors, spacing, fonts)
- Deviate from the spec
- Add features not in spec
- Use Light Mode
- Ask me architecture questions (spec has answers)

I'll review features every Saturday and tell you what to fix.

Start with Feature 1 (Homepage). Read the spec first, then generate code.

Ready?
```

---

## SECTION 13: FAQ FOR COWORK

**Q: Should I ask Ayoub before generating code?**
A: No. Read the spec, generate, test, commit. He reviews Saturdays.

**Q: What if the spec is unclear?**
A: The spec is complete. If something seems unclear, that's a signal to look harder in the document for the answer.

**Q: Should I use Redux?**
A: No. Spec says Zustand. Use Zustand.

**Q: What if I find a bug in the spec?**
A: Note it, mention in commit message, but follow spec anyway. Ayoub will address Saturday review.

**Q: How detailed should commits be?**
A: Good commits explain WHAT and WHY. Example:
```
feat: Agent execution with streaming (Week 2)

- Implement Server-Sent Events for real-time output
- Add Ollama client for local inference
- Create ExecutionOutput component with markdown rendering
- Add error handling for failed executions

Closes #2
```

**Q: Should I write tests?**
A: Yes, unit tests for utilities and hooks. Manual testing is required for all features.

**Q: What if I'm blocked?**
A: Log the blocker in a commit message, note it, move to next task if possible. Ayoub will debug Saturday.

---

# HOW TO START

## Step 1: Create Cowork Project
```
Open Claude Cowork
Create new project: "Shipyard"
Upload this spec as project instructions
Link GitHub repo: github.com/[you]/shipyard
```

## Step 2: Give Cowork Permission to Commit
```
Set up GitHub token in Cowork
Allow Cowork to commit and push to main (or dev branch)
```

## Step 3: Start Task
```
"Cowork, read the Shipyard spec and start building Feature 1 (Homepage).
Test locally, then commit to GitHub.
I'll review Saturday.
Start now."
```

## Step 4: You Review Saturdays
```
Pull the GitHub changes
npm install
npm run dev
Test the features locally
Approve or list fixes needed
```

## Step 5: Next Week Begins
```
Cowork continues with Feature 2
You focus on product decisions, marketing, community
```

---

**That's it. Cowork handles the build. You handle strategy. Ship Shipyard in 5 months. 🚀**
