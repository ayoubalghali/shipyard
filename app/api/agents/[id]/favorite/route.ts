import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, DB_AVAILABLE } from "@/lib/db";

type RouteContext = { params: { id: string } };

// GET /api/agents/[id]/favorite — check if current user has favorited
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !DB_AVAILABLE) {
    return NextResponse.json({ isFavorited: false });
  }
  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!dbUser) return NextResponse.json({ isFavorited: false });

    const fav = await prisma.favorite.findUnique({
      where: { user_id_agent_id: { user_id: dbUser.id, agent_id: params.id } },
    });
    return NextResponse.json({ isFavorited: Boolean(fav) });
  } catch {
    return NextResponse.json({ isFavorited: false });
  }
}

// POST /api/agents/[id]/favorite — toggle favorite
export async function POST(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!DB_AVAILABLE) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existing = await prisma.favorite.findUnique({
      where: { user_id_agent_id: { user_id: dbUser.id, agent_id: params.id } },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { user_id_agent_id: { user_id: dbUser.id, agent_id: params.id } },
      });
      return NextResponse.json({ isFavorited: false });
    } else {
      await prisma.favorite.create({
        data: { user_id: dbUser.id, agent_id: params.id },
      });
      return NextResponse.json({ isFavorited: true });
    }
  } catch (err) {
    console.error("[favorite POST]", err);
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 });
  }
}
