import { NextResponse } from "next/server";

import { getAdminSession, roleCan } from "@/lib/auth";
import { toCapsuleMeta } from "@/lib/capsules";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await getAdminSession();
    if (!session.isAdmin || !session.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!roleCan(session.role, "view_sealed")) {
      return NextResponse.json({ error: "Seers only — sealed messages are hidden from couriers." }, { status: 403 });
    }

    const { id } = await params;
    const capsule = await prisma.capsule.findUnique({ where: { id } });
    if (!capsule) {
      return NextResponse.json({ error: "Capsule not found" }, { status: 404 });
    }

    return NextResponse.json({
      capsule: {
        ...toCapsuleMeta(capsule),
        bodyHtml: capsule.bodyHtml,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load capsule";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await getAdminSession();
    if (!session.isAdmin || !session.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!roleCan(session.role, "delete")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.capsule.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ error: "Capsule not found" }, { status: 404 });
    }

    await prisma.capsule.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
