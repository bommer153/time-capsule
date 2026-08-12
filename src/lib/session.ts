import { SessionOptions, getIronSession } from "iron-session";
import { cookies } from "next/headers";

import type { AdminRole } from "@/lib/roles";

export type AdminSession = {
  isAdmin?: boolean;
  role?: AdminRole;
  username?: string;
};

export function getSessionOptions(): SessionOptions | null {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    return null;
  }

  return {
    cookieName: "time_capsule_admin",
    password,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    },
  };
}

export async function getAdminSession(): Promise<AdminSession> {
  const options = getSessionOptions();
  if (!options) return {};
  try {
    return await getIronSession<AdminSession>(await cookies(), options);
  } catch {
    return {};
  }
}

export async function requireAdminSession() {
  const options = getSessionOptions();
  if (!options) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }
  return getIronSession<AdminSession>(await cookies(), options);
}
