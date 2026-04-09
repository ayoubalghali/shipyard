import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, DB_AVAILABLE } from "@/lib/db";

// GET /api/user/profile — get current user's profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!DB_AVAILABLE) {
    return NextResponse.json({ user: null });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        avatar_url: true,
        image: true,
        is_verified: true,
        stripe_account_id: true,
        total_earned: true,
        withdrawn: true,
        created_at: true,
        _count: { select: { agents: true, executions: true, favorites: true } },
      },
    });
    return NextResponse.json({ user });
  } catch (err) {
    console.error("[profile GET]", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// PATCH /api/user/profile — update name, bio
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!DB_AVAILABLE) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  let body: { name?: string; bio?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, bio } = body;
  if (name !== undefined && (typeof name !== "string" || name.trim().length < 1)) {
    return NextResponse.json({ error: "Name must not be empty" }, { status: 400 });
  }
  if (bio !== undefined && typeof bio !== "string") {
    return NextResponse.json({ error: "Bio must be a string" }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(bio !== undefined ? { bio: bio.trim() } : {}),
      },
      select: { id: true, name: true, bio: true, avatar_url: true, email: true },
    });
    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error("[profile PATCH]", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
