import { Agent, Category } from "@/lib/types";

export const MOCK_AGENTS: Agent[] = [
  {
    id: "1",
    name: "Blog Post Writer",
    description:
      "Generate high-quality, SEO-optimized blog posts on any topic in seconds. Supports multiple tones and lengths.",
    category: "Workflows",
    tags: ["writing", "seo", "content"],
    rating: 4.9,
    usageCount: 5823,
    createdAt: "2024-11-01",
    creator: {
      id: "c1",
      name: "Sarah Chen",
      avatar: "SC",
      isVerified: true,
    },
  },
  {
    id: "2",
    name: "Code Reviewer",
    description:
      "Analyze your code for bugs, security issues, and best practices. Supports Python, TypeScript, Go, Rust and more.",
    category: "Code",
    tags: ["code", "review", "security"],
    rating: 4.8,
    usageCount: 3241,
    createdAt: "2024-10-20",
    creator: {
      id: "c2",
      name: "Marcus Webb",
      avatar: "MW",
      isVerified: true,
    },
  },
  {
    id: "3",
    name: "UI Screenshot to Code",
    description:
      "Upload a screenshot of any UI and get production-ready React + Tailwind code instantly.",
    category: "Visual",
    tags: ["ui", "react", "tailwind", "design"],
    rating: 4.7,
    usageCount: 2109,
    createdAt: "2024-12-05",
    creator: {
      id: "c3",
      name: "Yuki Tanaka",
      avatar: "YT",
      isVerified: false,
    },
  },
  {
    id: "4",
    name: "Email Campaign Builder",
    description:
      "Create entire email marketing campaigns — subject lines, body copy, CTAs — optimized for your audience.",
    category: "Workflows",
    tags: ["email", "marketing", "copywriting"],
    rating: 4.6,
    usageCount: 1887,
    createdAt: "2024-11-15",
    creator: {
      id: "c4",
      name: "Diego Ramirez",
      avatar: "DR",
      isVerified: true,
    },
  },
  {
    id: "5",
    name: "SQL Query Generator",
    description:
      "Describe what data you need in plain English and get optimized SQL queries. Supports PostgreSQL, MySQL, SQLite.",
    category: "Code",
    tags: ["sql", "database", "query"],
    rating: 4.8,
    usageCount: 4502,
    createdAt: "2024-09-30",
    creator: {
      id: "c5",
      name: "Priya Nair",
      avatar: "PN",
      isVerified: true,
    },
  },
  {
    id: "6",
    name: "Startup Pitch Deck",
    description:
      "Generate a compelling 10-slide pitch deck narrative with talking points for investors.",
    category: "Apps",
    tags: ["startup", "pitch", "investor"],
    rating: 4.5,
    usageCount: 1234,
    createdAt: "2024-12-01",
    creator: {
      id: "c6",
      name: "Alex Kim",
      avatar: "AK",
      isVerified: false,
    },
  },
  {
    id: "7",
    name: "Logo Concept Generator",
    description:
      "Describe your brand and get detailed logo concepts with color palettes, typography and mood boards.",
    category: "Visual",
    tags: ["design", "logo", "branding"],
    rating: 4.4,
    usageCount: 987,
    createdAt: "2024-11-28",
    creator: {
      id: "c7",
      name: "Fatima Al-Hassan",
      avatar: "FA",
      isVerified: false,
    },
  },
  {
    id: "8",
    name: "Customer Support Bot",
    description:
      "Train a support agent on your product docs and FAQs. Handles common questions automatically.",
    category: "Apps",
    tags: ["support", "chatbot", "customer"],
    rating: 4.7,
    usageCount: 3109,
    createdAt: "2024-10-10",
    creator: {
      id: "c8",
      name: "James Liu",
      avatar: "JL",
      isVerified: true,
    },
  },
  {
    id: "9",
    name: "Resume Optimizer",
    description:
      "Paste any job description and your resume — get a tailored version that passes ATS and impresses recruiters.",
    category: "Workflows",
    tags: ["resume", "career", "job"],
    rating: 4.9,
    usageCount: 7821,
    createdAt: "2024-08-15",
    creator: {
      id: "c9",
      name: "Emma Rodriguez",
      avatar: "ER",
      isVerified: true,
    },
  },
  {
    id: "10",
    name: "API Documentation Writer",
    description:
      "Upload your OpenAPI spec or paste code — get beautiful, developer-friendly docs in seconds.",
    category: "Code",
    tags: ["api", "docs", "openapi"],
    rating: 4.6,
    usageCount: 1543,
    createdAt: "2024-11-05",
    creator: {
      id: "c10",
      name: "Liam O'Brien",
      avatar: "LO",
      isVerified: false,
    },
  },
  {
    id: "11",
    name: "Social Media Scheduler",
    description:
      "Generate a week's worth of social media content for Twitter, LinkedIn, and Instagram in one click.",
    category: "Workflows",
    tags: ["social", "twitter", "linkedin"],
    rating: 4.5,
    usageCount: 2341,
    createdAt: "2024-10-25",
    creator: {
      id: "c11",
      name: "Zara Ahmed",
      avatar: "ZA",
      isVerified: true,
    },
  },
  {
    id: "12",
    name: "Data Analyzer",
    description:
      "Upload a CSV or paste data — get instant insights, patterns, and visualization recommendations.",
    category: "Apps",
    tags: ["data", "analytics", "csv"],
    rating: 4.7,
    usageCount: 2987,
    createdAt: "2024-09-20",
    creator: {
      id: "c12",
      name: "Nathan Park",
      avatar: "NP",
      isVerified: true,
    },
  },
];

export const FEATURED_AGENTS = MOCK_AGENTS.slice(0, 6);
export const TRENDING_AGENTS = [...MOCK_AGENTS].sort((a, b) => b.usageCount - a.usageCount).slice(0, 6);

export const CATEGORIES: Category[] = [
  {
    id: "workflows",
    name: "Workflows",
    icon: "⚡",
    description: "Automate repetitive tasks and business processes",
    agentCount: 48,
  },
  {
    id: "code",
    name: "Code",
    icon: "💻",
    description: "Write, review, and debug code with AI assistance",
    agentCount: 35,
  },
  {
    id: "visual",
    name: "Visual",
    icon: "🎨",
    description: "Generate images, design assets, and UI components",
    agentCount: 27,
  },
  {
    id: "apps",
    name: "Apps",
    icon: "🚀",
    description: "Build full applications and mini-tools without coding",
    agentCount: 31,
  },
  {
    id: "writing",
    name: "Writing",
    icon: "✍️",
    description: "Create compelling content, copy, and documents",
    agentCount: 42,
  },
  {
    id: "data",
    name: "Data",
    icon: "📊",
    description: "Analyze, visualize, and extract insights from data",
    agentCount: 19,
  },
  {
    id: "research",
    name: "Research",
    icon: "🔍",
    description: "Deep research, summarization, and information extraction",
    agentCount: 23,
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: "📣",
    description: "Campaigns, ads, SEO, and growth automation",
    agentCount: 38,
  },
];
