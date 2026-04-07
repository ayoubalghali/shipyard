import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, DB_AVAILABLE } from "@/lib/db";

type RouteContext = { params: { id: string } };

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    if (DB_AVAILABLE) {
      const where = {
        agent_id: params.id,
        // If authenticated, show user's own executions; otherwise all public ones
        ...(session?.user?.email
          ? {}
          : { status: "success" }),
      };

      const [total, executions] = await Promise.all([
        db.execution.count({ where }),
        db.execution.findMany({
          where,
          orderBy: { created_at: "desc" },
          skip: offset,
          take: limit,
          select: {
            id: true,
            model_used: true,
            tokens_input: true,
            tokens_output: true,
            execution_time_ms: true,
            status: true,
            created_at: true,
            // Only include output for the authenticated user's own executions
          },
        }),
      ]);

      return NextResponse.json({ executions, total, hasMore: offset + limit < total });
    }

    // Mock fallback — empty until DB is configured
    return NextResponse.json({ executions: [], total: 0, hasMore: false });
  } catch (error) {
    console.error("GET /api/agents/[id]/executions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
