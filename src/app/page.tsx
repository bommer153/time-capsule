import Link from "next/link";
import nextDynamic from "next/dynamic";
import { PartyPopper, Sparkles } from "lucide-react";

import { CapsuleList } from "@/components/capsule-list";
import { FloatingBunnies } from "@/components/floating-bunnies";
import { toCapsuleMeta } from "@/lib/capsules";
import { EVENT } from "@/lib/event";
import { prisma } from "@/lib/prisma";

const CreateCapsuleForm = nextDynamic(
  () => import("@/components/create-capsule-form").then((m) => m.CreateCapsuleForm),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 animate-pulse rounded-3xl border border-pink-200/70 bg-white/50" />
    ),
  },
);

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let capsules: Array<{
    id: string;
    authorName: string | null;
    category: string | null;
    createdAt: Date;
    unlockAt: Date | null;
    openedViaImport: boolean;
  }> = [];

  try {
    capsules = await prisma.capsule.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        authorName: true,
        category: true,
        createdAt: true,
        unlockAt: true,
        openedViaImport: true,
      },
    });
  } catch (error) {
    console.error("Failed to load capsules", error);
  }

  return (
    <div className="relative mx-auto w-full max-w-5xl px-6 pb-16">
      <FloatingBunnies />

      <section className="relative z-10 mb-14 grid items-center gap-10 pt-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-10">
        <div className="animate-rise">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-pink-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-pink-700 backdrop-blur-sm">
            <PartyPopper className="h-3.5 w-3.5" />
            {EVENT.sealedOnLabel} · Aug 12
          </p>
          <h1 className="font-display text-5xl leading-[1.05] text-pink-950 sm:text-6xl lg:text-7xl">
            {EVENT.brand}
          </h1>
          <p className="mt-2 font-display text-2xl text-pink-700/90 sm:text-3xl">Time Capsule</p>
          <p className="mt-4 max-w-lg text-base text-pink-900/75 sm:text-lg">
            Hop in, members! Seal a note for the owner, a colleague, a memory, a thank-you, a wish,
            a prediction, or the future of Bunny Radio. Everything stays locked until our{" "}
            <strong className="font-semibold text-pink-800">{EVENT.unlockOnLabel}</strong> —
            August 12, 2027.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/#create"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-400/40 transition hover:-translate-y-0.5 hover:brightness-105"
            >
              <Sparkles className="h-4 w-4" />
              Seal your message
            </Link>
            <Link
              href="/#vault"
              className="inline-flex items-center rounded-full border border-pink-300 bg-white/70 px-5 py-2.5 text-sm font-semibold text-pink-800 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
            >
              View sealed vault
            </Link>
          </div>
        </div>

        <div className="relative mx-auto h-64 w-full max-w-md animate-floaty lg:h-80">
          <div className="absolute inset-8 rounded-[2.5rem] bg-gradient-to-br from-pink-300 via-rose-400 to-fuchsia-400 opacity-80 blur-2xl animate-pulse-soft" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex h-56 w-56 items-center justify-center rounded-[2rem] border border-white/60 bg-white/50 shadow-2xl backdrop-blur-xl sm:h-64 sm:w-64">
              <div className="absolute -left-4 top-8 bunny-hop" style={{ animationDuration: "3.2s" }}>
                <span className="text-4xl drop-shadow">🐰</span>
              </div>
              <div className="absolute -right-3 -top-3 rounded-full bg-pink-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                OPENS 2027
              </div>
              <div className="text-center px-4">
                <p className="font-display text-5xl text-pink-950">2→3</p>
                <p className="mt-2 text-sm font-medium text-pink-800/80">
                  Sealed on our 2nd.
                  <br />
                  Opened on our 3rd.
                </p>
              </div>
              <div
                className="absolute -bottom-2 -right-2 bunny-wiggle"
                style={{ animationDuration: "4s" }}
              >
                <span className="text-3xl drop-shadow">🥕</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10">
        <CreateCapsuleForm />
      </div>

      <section id="vault" className="relative z-10 mt-14 scroll-mt-8">
        <h2 className="mb-4 font-display text-2xl text-pink-950">Vault</h2>
        <CapsuleList capsules={capsules.map(toCapsuleMeta)} />
      </section>
    </div>
  );
}
