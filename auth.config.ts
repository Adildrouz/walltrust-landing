import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth config (no Node-only deps like mongoose/bcrypt).
 * Imported by middleware.ts AND spread into the full config in auth.ts.
 */
export const authConfig = {
  // Read the secret explicitly so it works regardless of env var name
  // (Auth.js v5 prefers AUTH_SECRET; we also support the v4-style NEXTAUTH_SECRET).
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  // Trust the deployment host (Vercel) so the Edge middleware doesn't throw UntrustedHost.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login", error: "/auth/login" },
  providers: [], // real providers are attached in auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.plan = user.plan;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.plan = (token.plan ?? "free") as "free" | "starter" | "pro";
        session.user.username = (token.username ?? "") as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
