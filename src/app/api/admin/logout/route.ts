import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/session";

export async function POST() {
  const session = await getAdminSession();
  if (typeof (session as { destroy?: () => void }).destroy === "function") {
    (session as { destroy: () => void }).destroy();
  }
  return NextResponse.json({ ok: true });
}
