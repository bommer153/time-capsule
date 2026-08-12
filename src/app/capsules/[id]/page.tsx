import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";

import { getCategoryLabel, EVENT } from "@/lib/event";
import { prisma } from "@/lib/prisma";
import { isCapsuleUnlocked } from "@/lib/unlock";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function formatDate(value: Date) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(value);
}

export default async function CapsuleDetailPage({ params }: Props) {
  const { id } = await params;
  const capsule = await prisma.capsule.findUnique({ where: { id } });
  if (!capsule) notFound();

  const unlocked = isCapsuleUnlocked(capsule.unlockAt);
  const name = capsule.authorName?.trim() || "Anonymous";
  const categoryLabel = getCategoryLabel(capsule.category);

  return (
    <div className="mx-auto w-full max-w-xl px-6 pb-16 pt-4">
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-pink-800/70 hover:text-pink-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <article className="rounded-3xl border border-pink-200/80 bg-white/80 p-5 sm:p-6">
        <p className="text-xs font-medium text-pink-600">{categoryLabel}</p>
        <h1 className="mt-1 font-display text-2xl text-pink-950">{name}</h1>
        <p className="mt-1 text-xs text-pink-800/55">Sealed {formatDate(capsule.createdAt)}</p>

        <div className="mt-6">
          {unlocked ? (
            <div
              className="prose-capsule text-pink-950/90"
              dangerouslySetInnerHTML={{ __html: capsule.bodyHtml }}
            />
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <Lock className="mb-3 h-8 w-8 text-pink-500" />
              <p className="font-medium text-pink-950">Sealed</p>
              <p className="mt-1 text-sm text-pink-800/65">
                {capsule.unlockAt
                  ? `Opens ${formatDate(capsule.unlockAt)}`
                  : `Opens on the ${EVENT.unlockOnLabel}`}
              </p>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
