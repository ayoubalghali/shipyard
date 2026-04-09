import { NextRequest, NextResponse } from "next/server";
import { prisma, DB_AVAILABLE } from "@/lib/db";

// GET /api/stripe/callback — OAuth callback from Stripe Connect
// Exchanges the authorization code for the creator's Stripe account id.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const appBase = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${appBase}/creator/dashboard?stripe_error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appBase}/creator/dashboard?stripe_error=missing_params`);
  }

  // Decode state to get email
  let email: string;
  try {
    email = Buffer.from(state, "base64url").toString("utf-8");
  } catch {
    return NextResponse.redirect(`${appBase}/creator/dashboard?stripe_error=invalid_state`);
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.redirect(`${appBase}/creator/dashboard?stripe_error=not_configured`);
  }

  try {
    // Exchange code for Stripe account id
    const tokenRes = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_secret: secretKey,
      }),
    });

    const tokenData = await tokenRes.json() as {
      stripe_user_id?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenData.stripe_user_id) {
      const errMsg = tokenData.error_description ?? tokenData.error ?? "unknown";
      return NextResponse.redirect(
        `${appBase}/creator/dashboard?stripe_error=${encodeURIComponent(errMsg)}`
      );
    }

    // Persist to DB
    if (DB_AVAILABLE) {
      await prisma.user.update({
        where: { email },
        data: { stripe_account_id: tokenData.stripe_user_id },
      });
    }

    return NextResponse.redirect(`${appBase}/creator/dashboard?stripe_connected=1`);
  } catch (err) {
    console.error("[stripe/callback]", err);
    return NextResponse.redirect(`${appBase}/creator/dashboard?stripe_error=server_error`);
  }
}
