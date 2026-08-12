export function isCapsuleUnlocked(unlockAt: Date | null | undefined, now = new Date()) {
  return Boolean(unlockAt && unlockAt.getTime() <= now.getTime());
}
