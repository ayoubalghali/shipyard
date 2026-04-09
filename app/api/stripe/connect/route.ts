import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, DB_AVAILABLE } from "@/lib/db";

// GET /api/stripe/connect — get the Stripe Connect OAuth URL for this user
// Uses Standard Connect (OAuth) so creators connect their own Stripe accounts.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.STRIPE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Stripe Connect is not configured. Set STRIPE_CLIENT_ID in .env.local." },
      { status: 503 }
    );
  }

  // Use the user's email as state to verify the callback
  const state = Buffer.from(session.user.email).toString("base64url");
  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/stripe/callback`;

  const url = new URL("https://connect.stripe.com/oauth/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", "read_write");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);

  return NextResponse.json({ url: url.toString() });
}

// DELETE /api/stripe/connect — disconnect Stripe account
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!DB_AVAILABLE) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: { stripe_account_id: null },
    });
    return NextResponse.json({ message: "Stripe account disconnected" });
  } catch (err) {
    console.error("[stripe/connect DELETE]", err);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
