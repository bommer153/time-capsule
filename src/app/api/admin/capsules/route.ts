import { NextResponse } from "next/server";

import { getAdminSession, roleCan } from "@/lib/auth";
import { toCapsuleMeta } from "@/lib/capsules";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session.isAdmin || !session.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const canView = roleCan(session.role, "view_sealed");

  const capsules = await prisma.capsule.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      authorName: true,
      category: true,
      createdAt: true,
      unlockAt: true,
      openedViaImport: true,
      bodyHtml: canView,
    },
  });

  return NextResponse.json({
    role: session.role,
    capsules: capsules.map((capsule) => ({
      ...toCapsuleMeta(capsule),
      bodyHtml: canView ? capsule.bodyHtml : null,
    })),
  });
}
