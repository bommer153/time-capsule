import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession, roleCan } from "@/lib/auth";
import { encryptCapsules } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

const exportSchema = z.object({
  ids: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session.isAdmin || !session.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!roleCan(session.role, "export")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const json = await request.json().catch(() => ({}));
    const parsed = exportSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid export request" }, { status: 400 });
    }

    const capsules = await prisma.capsule.findMany({
      where: parsed.data.ids?.length ? { id: { in: parsed.data.ids } } : undefined,
      orderBy: { createdAt: "asc" },
      select: {
        authorName: true,
        category: true,
        bodyHtml: true,
        createdAt: true,
      },
    });

    if (capsules.length === 0) {
      return NextResponse.json({ error: "No capsules to export" }, { status: 400 });
    }

    const file = encryptCapsules({
      capsules: capsules.map((c) => ({
        authorName: c.authorName,
        category: c.category,
        bodyHtml: c.bodyHtml,
        createdAt: c.createdAt.toISOString(),
      })),
    });

    return new NextResponse(JSON.stringify(file, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="bunny-radio-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
