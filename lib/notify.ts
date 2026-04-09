/**
 * Server-side notification factory.
 * Import and call in API routes after events (new review, execution, earning, etc.)
 *
 * Safe to call even when DB is unavailable — fails silently.
 */
import { db, DB_AVAILABLE } from "@/lib/db";

export type NotificationType = "review" | "execution" | "earning" | "system" | "follow";

interface NotifyOptions {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}

export async function notify(opts: NotifyOptions): Promise<void> {
  if (!DB_AVAILABLE) return;
  try {
    await db.notification.create({
      data: {
        user_id: opts.userId,
        type: opts.type,
        title: opts.title,
        body: opts.body,
        link: opts.link,
      },
    });
  } catch {
    // Non-fatal — never let a notification failure break the main request
  }
}

/** Convenience wrappers */
export const notifyReview = (userId: string, agentName: string, agentId: string, rating: number) =>
  notify({
    userId,
    type: "review",
    title: "New review on your agent",
    body: `Someone left a ${rating}-star review on "${agentName}"`,
    link: `/agent/${agentId}#reviews`,
  });

export const notifyEarning = (userId: string, agentName: string, amountUsd: number) =>
  notify({
    userId,
    type: "earning",
    title: "You earned money!",
    body: `$${amountUsd.toFixed(2)} earned from a run of "${agentName}"`,
    link: `/creator/dashboard`,
  });

export const notifyExecution = (userId: string, agentName: string, agentId: string) =>
  notify({
    userId,
    type: "execution",
    title: "Your agent was used",
    body: `"${agentName}" was just executed`,
    link: `/agent/${agentId}`,
  });

export const notifySystem = (userId: string, title: string, body: string, link?: string) =>
  notify({ userId, type: "system", title, body, link });
