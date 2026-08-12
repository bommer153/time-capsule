"use client";

import Link from "next/link";
import { CalendarClock, Lock, Unlock } from "lucide-react";
import { useMemo, useState } from "react";

import type { CapsuleMeta } from "@/lib/capsules";
import { EVENT } from "@/lib/event";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CapsuleCard({ capsule }: { capsule: CapsuleMeta }) {
  const name = capsule.authorName?.trim() || "Anonymous member";

  return (
    <Link
      href={`/capsules/${capsule.id}`}
      className="group block rounded-3xl border border-pink-200/80 bg-white/60 p-5 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-pink-300 hover:shadow-[0_18px_40px_-28px_rgba(236,72,153,0.7)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-pink-600">
            {capsule.categoryLabel}
          </p>
          <p className="mt-1 font-display text-xl text-pink-950">{name}</p>
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
            ? `Opens ${formatDate(capsule.unlockAt)}`
            : `Locked until ${EVENT.unlockOnLabel} (after admin import)`
          : "Unlocked for the anniversary reveal"}
      </p>
    </Link>
  );
}

type Tab = "sealed" | "opened";

export function CapsuleList({ capsules }: { capsules: CapsuleMeta[] }) {
  const [tab, setTab] = useState<Tab>("sealed");

  const sealed = useMemo(() => capsules.filter((c) => c.isLocked), [capsules]);
  const opened = useMemo(() => capsules.filter((c) => !c.isLocked), [capsules]);
  const visible = tab === "sealed" ? sealed : opened;

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-full border border-pink-200 bg-white/70 p-1 backdrop-blur">
        <button
          type="button"
          onClick={() => setTab("sealed")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            tab === "sealed" ? "bg-pink-500 text-white" : "text-pink-800/70 hover:text-pink-950"
          }`}
        >
          Sealed ({sealed.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("opened")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            tab === "opened" ? "bg-pink-500 text-white" : "text-pink-800/70 hover:text-pink-950"
          }`}
        >
          Opened ({opened.length})
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-pink-200 bg-white/40 px-6 py-10 text-center text-pink-800/70">
          {tab === "sealed"
            ? "No sealed notes yet. Be the first Bunny Radio member to leave one."
            : "No opened capsules yet — they appear here after the 3rd anniversary unlock."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((capsule) => (
            <CapsuleCard key={capsule.id} capsule={capsule} />
          ))}
        </div>
      )}
    </div>
  );
}
