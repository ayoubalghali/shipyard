import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, DB_AVAILABLE } from "@/lib/db";
import { MOCK_AGENTS } from "@/lib/mockData";

async function isAdmin(email: string) {
  if (!DB_AVAILABLE) return email === process.env.ADMIN_EMAIL;
  try {
    const user = await db.user.findUnique({ where: { email } });
    return user?.is_admin ?? false;
  } catch {
    return false;
  }
}

// GET /api/admin/agents — list all agents with management data
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdmin(session.user.email))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
  const status = url.searchParams.get("status") ?? undefined;

  if (DB_AVAILABLE) {
    try {
      const where = status ? { status } : {};
      const [total, agents] = await Promise.all([
        db.agent.count({ where }),
        db.agent.findMany({
          where,
          orderBy: { created_at: "desc" },
          skip: offset,
          take: limit,
          include: {
            creator: { select: { id: true, name: true, email: true } },
            _count: { select: { executions: true, reviews: true, favorites: true } },
          },
        }),
      ]);
      return NextResponse.json({ agents, total, hasMore: offset + limit < total });
    } catch (err) {
      console.error("Admin agents GET error:", err);
    }
  }

  return NextResponse.json({
    agents: MOCK_AGENTS.slice(offset, offset + limit),
    total: MOCK_AGENTS.length,
    hasMore: false,
  });
}

// PATCH /api/admin/agents — update agent status or featured flag
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdmin(session.user.email))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as {
    id: string;
    status?: string;
    is_featured?: boolean;
    is_public?: boolean;
  };

  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (DB_AVAILABLE) {
    try {
      const agent = await db.agent.update({
        where: { id: body.id },
        data: {
          ...(body.status !== undefined && { status: body.status }),
          ...(body.is_featured !== undefined && { is_featured: body.is_featured }),
          ...(body.is_public !== undefined && { is_public: body.is_public }),
        },
      });
      return NextResponse.json({ agent });
    } catch (err) {
      console.error("Admin agents PATCH error:", err);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, message: "Mock update (no DB)" });
}
