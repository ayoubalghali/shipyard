import { MetadataRoute } from "next";
import { db, DB_AVAILABLE } from "@/lib/db";
import { MOCK_AGENTS } from "@/lib/mockData";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://shipyard.ai";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/explore`, lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE_URL}/create`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/login`,   lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];

  // Dynamic agent pages from DB (up to 1 000)
  let agentRoutes: MetadataRoute.Sitemap = [];

  if (DB_AVAILABLE) {
    try {
      const agents = await db.agent.findMany({
        where: { status: "published", is_public: true },
        select: { id: true, updated_at: true },
        orderBy: { usage_count: "desc" },
        take: 1000,
      });
      agentRoutes = agents.map((a: { id: string; updated_at: Date }) => ({
        url: `${BASE_URL}/agent/${a.id}`,
        lastModified: a.updated_at,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    } catch {
      // fall through to mock
    }
  }

  if (agentRoutes.length === 0) {
    agentRoutes = MOCK_AGENTS.map((a) => ({
      url: `${BASE_URL}/agent/${a.id}`,
      lastModified: new Date(a.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  }

  const creatorRoutes: MetadataRoute.Sitemap = Array.from(
    new Set(MOCK_AGENTS.map((a) => a.creator.name.toLowerCase().replace(/\s+/g, "-")))
  ).map((username) => ({
    url: `${BASE_URL}/profile/${username}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...agentRoutes, ...creatorRoutes];
}
