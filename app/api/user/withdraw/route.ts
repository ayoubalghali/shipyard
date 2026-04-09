import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, DB_AVAILABLE } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      amount?: number;
      stripe_account_id?: string;
    };

    if (!body.amount || body.amount <= 0) {
      return NextResponse.json({ error: "Invalid withdrawal amount" }, { status: 400 });
    }
    if (!body.stripe_account_id) {
      return NextResponse.json({ error: "Stripe account ID required" }, { status: 400 });
    }

    if (DB_AVAILABLE) {
      const user = await db.user.findUnique({ where: { email: session.user.email } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });
      if (!user.stripe_account_id) {
        return NextResponse.json({ error: "No Stripe account connected" }, { status: 400 });
      }

      const available = user.total_earned - user.withdrawn;
      if (body.amount > available) {
        return NextResponse.json(
          { error: `Insufficient balance. Available: $${available.toFixed(2)}` },
          { status: 400 }
        );
      }

      // Initiate a Stripe Transfer to the creator's connected account
      let stripePayoutId = `po_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (stripeSecretKey) {
        try {
          const amountCents = Math.round(body.amount * 100);
          const transferRes = await fetch("https://api.stripe.com/v1/transfers", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${stripeSecretKey}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              amount: amountCents.toString(),
              currency: "usd",
              destination: user.stripe_account_id,
              description: "Shipyard creator earnings withdrawal",
            }),
          });
          const transferData = await transferRes.json() as { id?: string; error?: { message?: string } };
          if (transferData.id) {
            stripePayoutId = transferData.id;
          } else {
            const errMsg = transferData.error?.message ?? "Stripe Transfer failed";
            return NextResponse.json({ error: errMsg }, { status: 400 });
          }
        } catch (stripeErr) {
          console.error("[withdraw] Stripe Transfer error:", stripeErr);
          return NextResponse.json({ error: "Stripe transfer failed" }, { status: 500 });
        }
      }

      // Record the withdrawal
      await db.user.update({
        where: { id: user.id },
        data: { withdrawn: { increment: body.amount } },
      });

      const payoutId = stripePayoutId;

      return NextResponse.json({
        payout_id: payoutId,
        amount: body.amount,
        status: "pending",
        message: "Withdrawal initiated. Funds arrive in 2-3 business days.",
      });
    }

    // Mock response for demo
    return NextResponse.json({
      payout_id: `po_demo_${Date.now()}`,
      amount: body.amount,
      status: "pending",
      message: "Withdrawal initiated (demo mode — configure DATABASE_URL and Stripe to process real payouts).",
    });
  } catch (error) {
    console.error("POST /api/user/withdraw error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
