import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, DB_AVAILABLE } from "@/lib/db";

// GET /api/user/favorites — list the current user's favorited agents
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");

  if (!DB_AVAILABLE) {
    return NextResponse.json({ favorites: [], total: 0, hasMore: false });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!dbUser) return NextResponse.json({ favorites: [], total: 0, hasMore: false });

    const [favs, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { user_id: dbUser.id },
        orderBy: { created_at: "desc" },
        skip: offset,
        take: limit,
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              tags: true,
              rating: true,
              usage_count: true,
              status: true,
              creator: { select: { id: true, name: true, avatar_url: true, image: true } },
            },
          },
        },
      }),
      prisma.favorite.count({ where: { user_id: dbUser.id } }),
    ]);

    return NextResponse.json({ favorites: favs, total, hasMore: offset + limit < total });
  } catch (err) {
    console.error("[user/favorites GET]", err);
    return NextResponse.json({ favorites: [], total: 0, hasMore: false });
  }
}
