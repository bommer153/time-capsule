import Link from "next/link";
import { HeartHandshake } from "lucide-react";

import { CapsuleList } from "@/components/capsule-list";
import { CreateCapsuleForm } from "@/components/create-capsule-form";
import { toCapsuleMeta } from "@/lib/capsules";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const capsules = await prisma.capsule.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      authorName: true,
      createdAt: true,
      unlockAt: true,
      openedViaImport: true,
    },
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-16">
      <section className="relative mb-14 grid items-center gap-10 pt-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-10">
        <div className="animate-rise">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-pink-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-pink-700">
            <HeartHandshake className="h-3.5 w-3.5" />
            Soft secrets for later
          </p>
          <h1 className="font-display text-5xl leading-[1.05] text-pink-950 sm:text-6xl lg:text-7xl">
            Time Capsule
          </h1>
          <p className="mt-4 max-w-md text-base text-pink-900/75 sm:text-lg">
            Write a note, tuck in a photo, and seal it. Content stays locked until an admin imports
            the encrypted JSON with the date it should open.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/#create"
              className="inline-flex items-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-400/40 transition hover:brightness-105"
            >
              Seal a message
            </Link>
            <Link
              href="/#vault"
              className="inline-flex items-center rounded-full border border-pink-300 bg-white/60 px-5 py-2.5 text-sm font-semibold text-pink-800 backdrop-blur transition hover:bg-white"
            >
              Browse sealed vault
            </Link>
          </div>
        </div>

        <div className="relative mx-auto h-64 w-full max-w-md animate-floaty lg:h-80">
          <div className="absolute inset-8 rounded-[2.5rem] bg-gradient-to-br from-pink-300 via-rose-400 to-fuchsia-400 opacity-80 blur-2xl animate-pulse-soft" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex h-56 w-56 items-center justify-center rounded-[2rem] border border-white/50 bg-white/40 shadow-2xl backdrop-blur-xl sm:h-64 sm:w-64">
              <div className="absolute -right-3 -top-3 rounded-full bg-pink-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                SEALED
              </div>
              <div className="text-center">
                <p className="font-display text-4xl text-pink-950">♡</p>
                <p className="mt-2 text-sm font-medium text-pink-800/80">Your future mail</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CreateCapsuleForm />

      <section id="vault" className="mt-16 scroll-mt-8">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl text-pink-950">Sealed vault</h2>
            <p className="text-sm text-pink-800/65">Names and dates only — contents stay hidden while locked.</p>
          </div>
        </div>
        <CapsuleList capsules={capsules.map(toCapsuleMeta)} />
      </section>
    </div>
  );
}
