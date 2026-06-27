import type { DefaultSession } from "next-auth";

type PlanName = "free" | "starter" | "pro";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      plan: PlanName;
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    plan?: PlanName;
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    plan?: PlanName;
    username?: string;
  }
}
