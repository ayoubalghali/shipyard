import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, DB_AVAILABLE } from "@/lib/db";

// GET /api/user/executions — the current user's full execution history across all agents
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 50);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");

  if (!DB_AVAILABLE) {
    return NextResponse.json({ executions: [], total: 0, hasMore: false });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!dbUser) return NextResponse.json({ executions: [], total: 0, hasMore: false });

    const [executions, total] = await Promise.all([
      prisma.execution.findMany({
        where: { user_id: dbUser.id },
        orderBy: { created_at: "desc" },
        skip: offset,
        take: limit,
        select: {
          id: true,
          input_data: true,
          output: true,
          model_used: true,
          tokens_input: true,
          tokens_output: true,
          execution_time_ms: true,
          status: true,
          created_at: true,
          agent: {
            select: { id: true, name: true, category: true },
          },
        },
      }) as Promise<{
        id: string;
        input_data: unknown;
        output: string;
        model_used: string;
        tokens_input: number;
        tokens_output: number;
        execution_time_ms: number;
        status: string;
        created_at: Date;
        agent: { id: string; name: string; category: string };
      }[]>,
      prisma.execution.count({ where: { user_id: dbUser.id } }),
    ]);

    return NextResponse.json({
      executions: executions.map((e) => ({ ...e, created_at: e.created_at.toISOString() })),
      total,
      hasMore: offset + limit < total,
    });
  } catch (err) {
    console.error("[user/executions GET]", err);
    return NextResponse.json({ executions: [], total: 0, hasMore: false });
  }
}
