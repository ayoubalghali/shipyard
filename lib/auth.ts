import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma, DB_AVAILABLE } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    // On every sign-in: upsert user row in Supabase + attach provider to token
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.provider = account.provider;

        if (DB_AVAILABLE && profile.email) {
          try {
            await prisma.user.upsert({
              where: { email: profile.email },
              update: {
                name: (profile.name ?? token.name ?? "").toString(),
                avatar_url: ((profile as { image?: string }).image ?? null),
              },
              create: {
                email: profile.email,
                name: (profile.name ?? "").toString(),
                avatar_url: ((profile as { image?: string }).image ?? null),
              },
            });
          } catch (err) {
            // Non-fatal — user still signs in even if DB write fails
            console.error("[auth] DB upsert error:", err);
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session as typeof session & { provider?: string }).provider =
          token.provider as string | undefined;

        // Enrich session with Supabase user fields (id, verified status, Stripe)
        if (DB_AVAILABLE && session.user.email) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: session.user.email },
              select: { id: true, is_verified: true, stripe_account_id: true },
            });
            if (dbUser) {
              const extUser = session.user as typeof session.user & {
                dbId?: string;
                isVerified?: boolean;
                hasStripe?: boolean;
              };
              extUser.dbId = dbUser.id as string;
              extUser.isVerified = dbUser.is_verified as boolean;
              extUser.hasStripe = Boolean(dbUser.stripe_account_id);
            }
          } catch (err) {
            console.error("[auth] session DB lookup error:", err);
          }
        }
      }
      return session;
    },
  },
};
