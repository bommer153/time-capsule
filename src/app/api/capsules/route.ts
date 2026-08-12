import { NextResponse } from "next/server";
import { z } from "zod";

import { toCapsuleMeta } from "@/lib/capsules";
import { prisma } from "@/lib/prisma";
import { sanitizeCapsuleHtml } from "@/lib/sanitize";

const createSchema = z.object({
  authorName: z.string().trim().max(80).optional().nullable(),
  bodyHtml: z.string().min(1, "Write a message before sealing."),
});

export async function GET() {
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

  return NextResponse.json({ capsules: capsules.map(toCapsuleMeta) });
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const authorName = parsed.data.authorName?.trim() || null;
    const bodyHtml = sanitizeCapsuleHtml(parsed.data.bodyHtml);

    if (!bodyHtml.replace(/<[^>]*>/g, "").trim() && !bodyHtml.includes("<img")) {
      return NextResponse.json({ error: "Write a message before sealing." }, { status: 400 });
    }

    const capsule = await prisma.capsule.create({
      data: {
        authorName,
        bodyHtml,
      },
      select: {
        id: true,
        authorName: true,
        createdAt: true,
        unlockAt: true,
        openedViaImport: true,
      },
    });

    return NextResponse.json({ capsule: toCapsuleMeta(capsule) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not seal capsule";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
