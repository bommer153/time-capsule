import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    return NextResponse.json({
      isAdmin: Boolean(session.isAdmin && session.role),
      role: session.role ?? null,
    });
  } catch {
    return NextResponse.json({ isAdmin: false, role: null });
  }
}
