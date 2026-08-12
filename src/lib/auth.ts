import { SessionOptions, getIronSession } from "iron-session";
import { cookies } from "next/headers";

import { type AdminRole, ROLE_META, roleCan } from "@/lib/roles";

export type { AdminRole };
export { ROLE_META, roleCan };

export type AdminSession = {
  isAdmin?: boolean;
  role?: AdminRole;
  username?: string;
};

export function resolveAdminLogin(
  username: string,
  password: string,
): { role: AdminRole; username: string } | null {
  const vaultUser = process.env.VAULT_ADMIN_USERNAME || process.env.ADMIN_USERNAME;
  const vaultPass = process.env.VAULT_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  const exportUser = process.env.EXPORT_ADMIN_USERNAME;
  const exportPass = process.env.EXPORT_ADMIN_PASSWORD;

  if (vaultUser && vaultPass && username === vaultUser && password === vaultPass) {
    return { role: "vault", username: vaultUser };
  }
  if (exportUser && exportPass && username === exportUser && password === exportPass) {
    return { role: "export", username: exportUser };
  }
  return null;
}

export function getSessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
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

export async function getAdminSession() {
  return getIronSession<AdminSession>(await cookies(), getSessionOptions());
}

export async function requireAdmin(power?: string) {
  const session = await getAdminSession();
  if (!session.isAdmin || !session.role) {
    throw new Error("UNAUTHORIZED");
  }
  if (power && !roleCan(session.role, power)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
