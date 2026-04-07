/**
 * Prisma client singleton for Supabase (PostgreSQL).
 *
 * Setup:
 *   1. Copy .env.local.example → .env.local and set DATABASE_URL
 *   2. Run: npm run db:generate   (generates the Prisma client)
 *   3. Run: npm run db:push       (pushes schema to Supabase)
 *   4. Run: npm run db:seed       (loads test data)
 *
 * The `postinstall` script runs `prisma generate` automatically after `npm install`.
 */

// Use a require-based import so the build doesn't hard-fail if the client
// hasn't been generated yet (e.g. in CI before the generate step).
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const { PrismaClient } = require("@prisma/client") as { PrismaClient: new (opts?: object) => any };

type PrismaClientInstance = ReturnType<typeof PrismaClient.prototype.constructor> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

// Prevent multiple PrismaClient instances in Next.js hot-reload
const globalForPrisma = global as unknown as { prisma: PrismaClientInstance };

export const prisma: PrismaClientInstance =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Backwards-compatible alias used by earlier API routes */
export const db = prisma;

/** True when a real DATABASE_URL is configured */
export const DB_AVAILABLE = Boolean(process.env.DATABASE_URL);
