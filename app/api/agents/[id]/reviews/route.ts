import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, DB_AVAILABLE } from "@/lib/db";

type RouteContext = { params: { id: string } };

// GET /api/agents/[id]/reviews — list reviews for an agent
export async function GET(req: NextRequest, { params }: RouteContext) {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 50);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");

  if (!DB_AVAILABLE) {
    return NextResponse.json({ reviews: [], total: 0, hasMore: false });
  }

  try {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { agent_id: params.id },
        orderBy: { created_at: "desc" },
        skip: offset,
        take: limit,
        include: {
          user: { select: { id: true, name: true, avatar_url: true, image: true } },
        },
      }),
      prisma.review.count({ where: { agent_id: params.id } }),
    ]);

    return NextResponse.json({ reviews, total, hasMore: offset + limit < total });
  } catch (err) {
    console.error("[reviews GET]", err);
    return NextResponse.json({ reviews: [], total: 0, hasMore: false });
  }
}

// POST /api/agents/[id]/reviews — create or update a review
export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { rating: number; comment?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { rating, comment } = body;
  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json({ error: "Rating must be an integer 1–5" }, { status: 400 });
  }

  if (!DB_AVAILABLE) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  try {
    // Resolve user id
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Upsert review (one per user per agent)
    const review = await prisma.review.upsert({
      where: { user_id_agent_id: { user_id: dbUser.id, agent_id: params.id } },
      update: { rating, comment: comment ?? null },
      create: { agent_id: params.id, user_id: dbUser.id, rating, comment: comment ?? null },
      include: {
        user: { select: { id: true, name: true, avatar_url: true, image: true } },
      },
    });

    // Recalculate and persist agent average rating
    const agg = await prisma.review.aggregate({
      where: { agent_id: params.id },
      _avg: { rating: true },
    });
    await prisma.agent.update({
      where: { id: params.id },
      data: { rating: Math.round((agg._avg.rating ?? 0) * 10) / 10 },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error("[reviews POST]", err);
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }
}

// DELETE /api/agents/[id]/reviews — delete the caller's review
export async function DELETE(req: NextRequest, { params }: RouteContext) {
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
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.review.delete({
      where: { user_id_agent_id: { user_id: dbUser.id, agent_id: params.id } },
    });

    // Recalculate rating
    const agg = await prisma.review.aggregate({
      where: { agent_id: params.id },
      _avg: { rating: true },
    });
    await prisma.agent.update({
      where: { id: params.id },
      data: { rating: Math.round((agg._avg.rating ?? 0) * 10) / 10 },
    });

    return NextResponse.json({ message: "Review deleted" });
  } catch (err) {
    console.error("[reviews DELETE]", err);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
