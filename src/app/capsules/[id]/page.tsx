import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock, Unlock } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { isCapsuleUnlocked } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function formatDate(value: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(value);
}

export default async function CapsuleDetailPage({ params }: Props) {
  const { id } = await params;
  const capsule = await prisma.capsule.findUnique({ where: { id } });
  if (!capsule) notFound();

  const unlocked = isCapsuleUnlocked(capsule.unlockAt);
  const name = capsule.authorName?.trim() || "Anonymous";

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-16 pt-4">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-pink-800/70 transition hover:text-pink-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to vault
      </Link>

      <article className="overflow-hidden rounded-[2rem] border border-pink-200/80 bg-white/75 shadow-[0_24px_60px_-34px_rgba(236,72,153,0.55)] backdrop-blur">
        <div className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-6 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl text-pink-950 sm:text-4xl">{name}</h1>
              <p className="mt-2 text-sm text-pink-800/65">Sealed {formatDate(capsule.createdAt)}</p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                unlocked ? "bg-emerald-100 text-emerald-700" : "bg-pink-100 text-pink-700"
              }`}
            >
              {unlocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {unlocked ? "Unlocked" : "Locked"}
            </span>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-8">
          {unlocked ? (
            <div
              className="prose-capsule text-pink-950/90"
              dangerouslySetInnerHTML={{ __html: capsule.bodyHtml }}
            />
          ) : (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="mb-4 rounded-full bg-pink-100 p-5 text-pink-600 animate-pulse-soft">
                <Lock className="h-10 w-10" />
              </div>
              <h2 className="font-display text-2xl text-pink-950">Still sealed</h2>
              <p className="mt-2 max-w-md text-sm text-pink-800/70">
                {capsule.unlockAt
                  ? `This capsule opens on ${formatDate(capsule.unlockAt)}.`
                  : "This capsule has no unlock date yet. An admin must import the encrypted JSON and choose when it opens."}
              </p>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
