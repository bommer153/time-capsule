import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession, roleCan } from "@/lib/auth";
import { decryptCapsules, type EncryptedCapsuleFile } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { sanitizeCapsuleHtml } from "@/lib/sanitize";

const importMetaSchema = z.object({
  unlockAt: z.string().datetime({ offset: true }).or(z.string().min(1)),
});

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session.isAdmin || !session.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!roleCan(session.role, "import")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const form = await request.formData();
    const unlockAtRaw = String(form.get("unlockAt") ?? "");
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Encrypted JSON file is required" }, { status: 400 });
    }

    const unlockParsed = importMetaSchema.safeParse({ unlockAt: new Date(unlockAtRaw).toISOString() });
    if (!unlockParsed.success || Number.isNaN(new Date(unlockAtRaw).getTime())) {
      return NextResponse.json({ error: "Choose a valid unlock date" }, { status: 400 });
    }

    const unlockAt = new Date(unlockAtRaw);
    const text = await file.text();
    let encrypted: EncryptedCapsuleFile;
    try {
      encrypted = JSON.parse(text) as EncryptedCapsuleFile;
    } catch {
      return NextResponse.json({ error: "File is not valid JSON" }, { status: 400 });
    }

    const payload = decryptCapsules(encrypted);
    if (!payload.capsules?.length) {
      return NextResponse.json({ error: "Export file has no capsules" }, { status: 400 });
    }

    const created = await prisma.$transaction(
      payload.capsules.map((capsule) =>
        prisma.capsule.create({
          data: {
            authorName: capsule.authorName?.trim() || null,
            category: capsule.category || "message",
            bodyHtml: sanitizeCapsuleHtml(capsule.bodyHtml),
            createdAt: capsule.createdAt ? new Date(capsule.createdAt) : new Date(),
            unlockAt,
            openedViaImport: true,
          },
        }),
      ),
    );

    return NextResponse.json({
      ok: true,
      imported: created.length,
      unlockAt: unlockAt.toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed";
    const status = message.includes("Unsupported") || message.includes("auth") ? 400 : 500;
    return NextResponse.json(
      {
        error:
          message.includes("Unsupported") ||
          message.toLowerCase().includes("auth") ||
          message.includes("Invalid")
            ? "Could not decrypt file. Check CAPSULE_EXPORT_KEY matches the export."
            : message,
      },
      { status },
    );
  }
}
