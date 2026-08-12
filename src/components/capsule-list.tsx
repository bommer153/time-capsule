"use client";

import Link from "next/link";
import { Lock, Unlock } from "lucide-react";
import { useMemo, useState } from "react";

import type { CapsuleMeta } from "@/lib/capsules";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export function CapsuleCard({ capsule }: { capsule: CapsuleMeta }) {
  const name = capsule.authorName?.trim() || "Anonymous";

  return (
    <Link
      href={`/capsules/${capsule.id}`}
      className="flex items-center justify-between gap-3 rounded-2xl border border-pink-200/80 bg-white/70 px-4 py-3 transition hover:border-pink-300 hover:bg-white"
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-pink-950">{name}</p>
        <p className="text-xs text-pink-800/55">
          {capsule.categoryLabel} · {formatDate(capsule.createdAt)}
        </p>
      </div>
      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${
          capsule.isLocked ? "bg-pink-100 text-pink-700" : "bg-emerald-100 text-emerald-700"
        }`}
      >
        {capsule.isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
        {capsule.isLocked ? "Sealed" : "Open"}
      </span>
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
    <div className="space-y-3">
      <div className="inline-flex rounded-full bg-pink-100/70 p-0.5 text-sm">
        <button
          type="button"
          onClick={() => setTab("sealed")}
          className={`rounded-full px-3 py-1 ${tab === "sealed" ? "bg-white font-semibold text-pink-800 shadow-sm" : "text-pink-800/60"}`}
        >
          Sealed {sealed.length}
        </button>
        <button
          type="button"
          onClick={() => setTab("opened")}
          className={`rounded-full px-3 py-1 ${tab === "opened" ? "bg-white font-semibold text-pink-800 shadow-sm" : "text-pink-800/60"}`}
        >
          Opened {opened.length}
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-pink-800/60">
          {tab === "sealed" ? "No sealed notes yet." : "Nothing opened yet."}
        </p>
      ) : (
        <div className="space-y-2">
          {visible.map((capsule) => (
            <CapsuleCard key={capsule.id} capsule={capsule} />
          ))}
        </div>
      )}
    </div>
  );
}
