import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, DB_AVAILABLE } from "@/lib/db";

async function isAdmin(email: string) {
  if (!DB_AVAILABLE) return email === process.env.ADMIN_EMAIL;
  try {
    const user = await db.user.findUnique({ where: { email } });
    return user?.is_admin ?? false;
  } catch {
    return false;
  }
}

// GET /api/admin/users — paginated user list
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdmin(session.user.email))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
  const search = url.searchParams.get("search")?.trim() ?? "";

  if (DB_AVAILABLE) {
    try {
      const where = search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" as const } },
              { name: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [total, users] = await Promise.all([
        db.user.count({ where }),
        db.user.findMany({
          where,
          orderBy: { created_at: "desc" },
          skip: offset,
          take: limit,
          select: {
            id: true,
            name: true,
            email: true,
            is_verified: true,
            is_admin: true,
            total_earned: true,
            created_at: true,
            _count: { select: { agents: true, executions: true } },
          },
        }),
      ]);
      return NextResponse.json({ users, total, hasMore: offset + limit < total });
    } catch (err) {
      console.error("Admin users GET error:", err);
    }
  }

  return NextResponse.json({
    users: [
      {
        id: "mock_1",
        name: "Demo User",
        email: "demo@shipyard.ai",
        is_verified: false,
        is_admin: false,
        total_earned: 0,
        created_at: new Date().toISOString(),
        _count: { agents: 0, executions: 0 },
      },
    ],
    total: 1,
    hasMore: false,
  });
}

// PATCH /api/admin/users — update user roles/verification
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdmin(session.user.email))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as {
    id: string;
    is_verified?: boolean;
    is_admin?: boolean;
  };

  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (DB_AVAILABLE) {
    try {
      const user = await db.user.update({
        where: { id: body.id },
        data: {
          ...(body.is_verified !== undefined && { is_verified: body.is_verified }),
          ...(body.is_admin !== undefined && { is_admin: body.is_admin }),
        },
        select: { id: true, name: true, email: true, is_verified: true, is_admin: true },
      });
      return NextResponse.json({ user });
    } catch (err) {
      console.error("Admin users PATCH error:", err);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, message: "Mock update (no DB)" });
}
