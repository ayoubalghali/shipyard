import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, DB_AVAILABLE } from "@/lib/db";

// GET /api/notifications — paginated notifications for current user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 50);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
  const unreadOnly = url.searchParams.get("unread") === "true";

  if (DB_AVAILABLE) {
    try {
      const user = await db.user.findUnique({ where: { email: session.user.email } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const where = {
        user_id: user.id,
        ...(unreadOnly ? { read: false } : {}),
      };

      const [total, unreadCount, notifications] = await Promise.all([
        db.notification.count({ where }),
        db.notification.count({ where: { user_id: user.id, read: false } }),
        db.notification.findMany({
          where,
          orderBy: { created_at: "desc" },
          skip: offset,
          take: limit,
        }),
      ]);

      return NextResponse.json({ notifications, total, unreadCount, hasMore: offset + limit < total });
    } catch (err) {
      console.error("GET /api/notifications error:", err);
    }
  }

  // Mock fallback — return empty
  return NextResponse.json({ notifications: [], total: 0, unreadCount: 0, hasMore: false });
}

// PATCH /api/notifications — mark as read (single or all)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { id?: string; markAllRead?: boolean };

  if (DB_AVAILABLE) {
    try {
      const user = await db.user.findUnique({ where: { email: session.user.email } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      if (body.markAllRead) {
        await db.notification.updateMany({
          where: { user_id: user.id, read: false },
          data: { read: true },
        });
      } else if (body.id) {
        await db.notification.update({
          where: { id: body.id, user_id: user.id },
          data: { read: true },
        });
      }

      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error("PATCH /api/notifications error:", err);
    }
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/notifications — delete a notification
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (DB_AVAILABLE) {
    try {
      const user = await db.user.findUnique({ where: { email: session.user.email } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      await db.notification.delete({ where: { id, user_id: user.id } });
      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error("DELETE /api/notifications error:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
