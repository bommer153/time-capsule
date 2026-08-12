export type AdminRole = "vault" | "export";

export const ROLE_META: Record<
  AdminRole,
  { title: string; tagline: string; powers: string[] }
> = {
  vault: {
    title: "Vault Access",
    tagline: "Private vault tools",
    powers: ["view_sealed", "delete", "import"],
  },
  export: {
    title: "Capsule Courier",
    tagline: "Export encrypted JSON · delete notes",
    powers: ["export", "delete"],
  },
};

export function roleCan(role: AdminRole | undefined, power: string) {
  if (!role) return false;
  return ROLE_META[role].powers.includes(power);
}
