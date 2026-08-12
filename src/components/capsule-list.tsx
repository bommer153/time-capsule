import Link from "next/link";
import { CalendarClock, Lock, Unlock } from "lucide-react";

import type { CapsuleMeta } from "@/lib/capsules";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CapsuleCard({ capsule }: { capsule: CapsuleMeta }) {
  const name = capsule.authorName?.trim() || "Anonymous";

  return (
    <Link
      href={`/capsules/${capsule.id}`}
      className="group block rounded-3xl border border-pink-200/80 bg-white/60 p-5 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-pink-300 hover:shadow-[0_18px_40px_-28px_rgba(236,72,153,0.7)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl text-pink-950">{name}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-pink-800/60">
            <CalendarClock className="h-3.5 w-3.5" />
            Sealed {formatDate(capsule.createdAt)}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
            capsule.isLocked
              ? "bg-pink-100 text-pink-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {capsule.isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
          {capsule.isLocked ? "Locked" : "Open"}
        </span>
      </div>
      <p className="mt-4 text-sm text-pink-900/65">
        {capsule.isLocked
          ? capsule.unlockAt
            ? `Sealed until ${formatDate(capsule.unlockAt)}`
            : "Locked — opens only after admin import with a date"
          : "This capsule has been unlocked"}
      </p>
    </Link>
  );
}

export function CapsuleList({ capsules }: { capsules: CapsuleMeta[] }) {
  if (capsules.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-pink-200 bg-white/40 px-6 py-10 text-center text-pink-800/70">
        No capsules yet. Be the first to seal one.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {capsules.map((capsule) => (
        <CapsuleCard key={capsule.id} capsule={capsule} />
      ))}
    </div>
  );
}
