import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = {
    ok: true,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasSessionSecret: Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32),
    hasExportKey: Boolean(process.env.CAPSULE_EXPORT_KEY),
  };

  try {
    const capsuleCount = await prisma.capsule.count();
    return NextResponse.json({
      ...env,
      database: "connected",
      capsuleCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database error";
    return NextResponse.json(
      {
        ...env,
        database: "error",
        databaseError: message,
      },
      { status: 500 },
    );
  }
}
