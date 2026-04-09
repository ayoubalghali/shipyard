import { NextResponse } from "next/server";
import { db, DB_AVAILABLE } from "@/lib/db";

// GET /api/health — liveness + readiness check for load balancers and Railway
export async function GET() {
  const start = Date.now();

  let dbStatus: "ok" | "unavailable" = "unavailable";
  if (DB_AVAILABLE) {
    try {
      await db.$queryRaw`SELECT 1`;
      dbStatus = "ok";
    } catch {
      dbStatus = "unavailable";
    }
  }

  const latencyMs = Date.now() - start;

  const body = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "unknown",
    db: dbStatus,
    latencyMs,
  };

  const response = NextResponse.json(body, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });

  return response;
}
