import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { toCapsuleMeta } from "@/lib/capsules";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const capsules = await prisma.capsule.findMany({
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

  return NextResponse.json({ capsules: capsules.map(toCapsuleMeta) });
}
