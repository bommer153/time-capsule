import { NextResponse } from "next/server";

import { getAdminSession, roleCan } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await getAdminSession();
    if (!session.isAdmin || !session.role || !roleCan(session.role, "manage_couriers")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.courierAccount.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Courier not found" }, { status: 404 });
    }

    if (existing.username === session.username) {
      return NextResponse.json({ error: "You can't remove your own account" }, { status: 400 });
    }

    await prisma.courierAccount.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
