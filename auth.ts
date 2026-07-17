import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        await connectDB();
        const user = await User.findOne({ email: parsed.data.email });
        if (!user || !user.emailVerified) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          plan: user.plan,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Overrides authConfig's base jwt callback (kept Edge-safe/DB-free there
    // on purpose) to additionally handle client-triggered session updates —
    // this needs connectDB()/User, which is why it lives here in the
    // Node-only config rather than in auth.config.ts.
    //
    // Without this, token.plan is only ever set at initial sign-in and never
    // re-derived afterward, so a user who upgrades mid-session keeps seeing
    // old-plan UI gates until they manually log out and back in — worst case
    // right after they've just paid. components/billing/PlanSyncOnSuccess.tsx
    // calls useSession().update() on the post-checkout landing, which re-runs
    // this callback with trigger === "update"; re-fetching fresh from the DB
    // (rather than trusting whatever the client passed via update()) is
    // deliberate — the client-supplied `session` payload here is
    // unauthenticated input and shouldn't be trusted to set token.plan.
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.plan = user.plan;
        token.username = user.username;
      }
      if (trigger === "update" && token.id) {
        await connectDB();
        const fresh = await User.findById(token.id as string).select("plan username").lean();
        if (fresh) {
          token.plan = fresh.plan;
          token.username = fresh.username;
        }
      }
      return token;
    },
  },
});
