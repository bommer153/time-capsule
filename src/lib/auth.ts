import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { type AdminRole, ROLE_META, roleCan } from "@/lib/roles";
import { getAdminSession, requireAdminSession } from "@/lib/session";

export type { AdminRole };
export { ROLE_META, roleCan };
export type { AdminSession } from "@/lib/session";
export { getAdminSession, requireAdminSession };

function resolveEnvAdminLogin(
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

export async function resolveAdminLogin(
  username: string,
  password: string,
): Promise<{ role: AdminRole; username: string } | null> {
  const trimmed = username.trim();
  const envHit = resolveEnvAdminLogin(trimmed, password);
  if (envHit) return envHit;

  const courier = await prisma.courierAccount.findUnique({
    where: { username: trimmed.toLowerCase() },
  });
  if (!courier) return null;
  if (!verifyPassword(password, courier.passwordHash)) return null;

  return { role: "export", username: courier.username };
}

export function getReservedUsernames() {
  return [
    process.env.VAULT_ADMIN_USERNAME || process.env.ADMIN_USERNAME,
    process.env.EXPORT_ADMIN_USERNAME,
  ]
    .filter(Boolean)
    .map((name) => String(name).toLowerCase());
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
