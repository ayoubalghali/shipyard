// Prisma client singleton with graceful degradation when DATABASE_URL is absent.
// Run `npm run db:generate` after cloning to generate the Prisma client.

/** True when a real DATABASE_URL is configured */
export const DB_AVAILABLE = Boolean(process.env.DATABASE_URL);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPrismaClient = any;

declare global {
  // Prevent multiple instances in hot-reload (dev)
  // eslint-disable-next-line no-var
  var __prisma: AnyPrismaClient | undefined;
}

function createClient(): AnyPrismaClient {
  // Dynamic require so the build doesn't fail when @prisma/client has no exports
  // (happens before `prisma generate` has been run)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client") as { PrismaClient: new (opts?: object) => AnyPrismaClient };
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const db: AnyPrismaClient = globalThis.__prisma ?? (DB_AVAILABLE ? createClient() : null);

if (process.env.NODE_ENV !== "production" && DB_AVAILABLE) {
  globalThis.__prisma = db;
}
