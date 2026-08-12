"use client";

import nextDynamic from "next/dynamic";

export const CreateCapsuleFormLazy = nextDynamic(
  () => import("@/components/create-capsule-form").then((m) => m.CreateCapsuleForm),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 animate-pulse rounded-3xl border border-pink-200/70 bg-white/50" />
    ),
  },
);
