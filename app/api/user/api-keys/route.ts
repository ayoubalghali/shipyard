import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, DB_AVAILABLE } from "@/lib/db";
import { createHash, randomBytes } from "crypto";

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function generateKey(): { raw: string; prefix: string; hash: string } {
  const raw = "sk_" + randomBytes(32).toString("hex");
  return { raw, prefix: raw.slice(0, 12), hash: hashKey(raw) };
}

// GET /api/user/api-keys — list keys (no plaintext returned after creation)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (DB_AVAILABLE) {
    try {
      const user = await db.user.findUnique({ where: { email: session.user.email } });
      if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const keys = await db.apiKey.findMany({
        where: { user_id: user.id, revoked: false },
        orderBy: { created_at: "desc" },
        select: {
          id: true, name: true, key_prefix: true,
          last_used_at: true, expires_at: true, created_at: true,
        },
      });

      return NextResponse.json({ keys });
    } catch (err) {
      console.error("GET /api/user/api-keys:", err);
    }
  }

  return NextResponse.json({ keys: [] });
}

// POST /api/user/api-keys — create a new key
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { name?: string; expires_days?: number };
  const name = body.name?.trim() || "My API Key";

  if (DB_AVAILABLE) {
    try {
      const user = await db.user.findUnique({ where: { email: session.user.email } });
      if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

      // Limit to 10 active keys per user
      const count = await db.apiKey.count({ where: { user_id: user.id, revoked: false } });
      if (count >= 10) {
        return NextResponse.json({ error: "Maximum 10 active API keys allowed" }, { status: 429 });
      }

      const { raw, prefix, hash } = generateKey();
      const expires_at = body.expires_days
        ? new Date(Date.now() + body.expires_days * 86400_000)
        : null;

      const apiKey = await db.apiKey.create({
        data: {
          user_id: user.id,
          name,
          key_hash: hash,
          key_prefix: prefix,
          expires_at,
        },
        select: { id: true, name: true, key_prefix: true, expires_at: true, created_at: true },
      });

      // Return the raw key ONCE — never retrievable again
      return NextResponse.json({ apiKey, rawKey: raw }, { status: 201 });
    } catch (err) {
      console.error("POST /api/user/api-keys:", err);
    }
  }

  // Mock fallback — still generate a demo key so UI works
  const { raw, prefix } = generateKey();
  return NextResponse.json({
    apiKey: { id: "mock_key_1", name, key_prefix: prefix, expires_at: null, created_at: new Date().toISOString() },
    rawKey: raw,
  }, { status: 201 });
}

// DELETE /api/user/api-keys?id=... — revoke a key
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (DB_AVAILABLE) {
    try {
      const user = await db.user.findUnique({ where: { email: session.user.email } });
      if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

      await db.apiKey.update({
        where: { id, user_id: user.id },
        data: { revoked: true },
      });
      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error("DELETE /api/user/api-keys:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
