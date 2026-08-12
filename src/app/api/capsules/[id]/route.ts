import { NextResponse } from "next/server";

import { toCapsuleMeta } from "@/lib/capsules";
import { prisma } from "@/lib/prisma";
import { isCapsuleUnlocked } from "@/lib/unlock";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  const capsule = await prisma.capsule.findUnique({ where: { id } });
  if (!capsule) {
    return NextResponse.json({ error: "Capsule not found" }, { status: 404 });
  }

  const meta = toCapsuleMeta(capsule);
  if (!isCapsuleUnlocked(capsule.unlockAt)) {
    return NextResponse.json({
      capsule: {
        ...meta,
        bodyHtml: null,
      },
    });
  }

  return NextResponse.json({
    capsule: {
      ...meta,
      bodyHtml: capsule.bodyHtml,
    },
  });
}
