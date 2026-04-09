/**
 * Validates a Bearer API key from the Authorization header.
 * Returns the user_id if valid, null otherwise.
 *
 * Usage in API routes:
 *   const userId = await verifyApiKey(req);
 *   if (!userId) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
 */
import { createHash } from "crypto";
import { db, DB_AVAILABLE } from "@/lib/db";
import { NextRequest } from "next/server";

export async function verifyApiKey(req: NextRequest): Promise<string | null> {
  if (!DB_AVAILABLE) return null;

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer sk_")) return null;

  const rawKey = auth.slice(7); // strip "Bearer "
  const hash = createHash("sha256").update(rawKey).digest("hex");

  try {
    const apiKey = await db.apiKey.findUnique({
      where: { key_hash: hash },
      select: { id: true, user_id: true, revoked: true, expires_at: true },
    });

    if (!apiKey || apiKey.revoked) return null;
    if (apiKey.expires_at && apiKey.expires_at < new Date()) return null;

    // Update last_used_at (fire-and-forget)
    db.apiKey.update({
      where: { id: apiKey.id },
      data: { last_used_at: new Date() },
    }).catch(() => null);

    return apiKey.user_id;
  } catch {
    return null;
  }
}
