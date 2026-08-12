import { getCategoryLabel } from "@/lib/event";
import { isCapsuleUnlocked } from "@/lib/sanitize";

export type CapsuleMeta = {
  id: string;
  authorName: string | null;
  category: string;
  categoryLabel: string;
  createdAt: string;
  unlockAt: string | null;
  openedViaImport: boolean;
  isLocked: boolean;
};

export function toCapsuleMeta(capsule: {
  id: string;
  authorName: string | null;
  category?: string | null;
  createdAt: Date;
  unlockAt: Date | null;
  openedViaImport: boolean;
}): CapsuleMeta {
  const category = capsule.category || "message";
  const isLocked = !isCapsuleUnlocked(capsule.unlockAt);
  return {
    id: capsule.id,
    authorName: capsule.authorName,
    category,
    categoryLabel: getCategoryLabel(category),
    createdAt: capsule.createdAt.toISOString(),
    unlockAt: capsule.unlockAt?.toISOString() ?? null,
    openedViaImport: capsule.openedViaImport,
    isLocked,
  };
}
