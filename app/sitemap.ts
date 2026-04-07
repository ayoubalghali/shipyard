import { MetadataRoute } from "next";
import { MOCK_AGENTS } from "@/lib/mockData";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://shipyard.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/explore`, lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/create`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/login`,   lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];

  const agentRoutes: MetadataRoute.Sitemap = MOCK_AGENTS.map((agent) => ({
    url: `${BASE_URL}/agent/${agent.id}`,
    lastModified: new Date(agent.createdAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

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
