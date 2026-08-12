import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession, getReservedUsernames, roleCan } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username is too long")
    .regex(/^[a-zA-Z0-9._-]+$/, "Use letters, numbers, dots, underscores, or dashes"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session.isAdmin || !session.role || !roleCan(session.role, "manage_couriers")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const couriers = await prisma.courierAccount.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      createdAt: true,
      createdBy: true,
    },
  });

  return NextResponse.json({
    couriers: couriers.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session.isAdmin || !session.role || !roleCan(session.role, "manage_couriers")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const json = await request.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const username = parsed.data.username.toLowerCase();
    if (getReservedUsernames().includes(username)) {
      return NextResponse.json({ error: "That username is reserved" }, { status: 400 });
    }

    const existing = await prisma.courierAccount.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const created = await prisma.courierAccount.create({
      data: {
        username,
        passwordHash: hashPassword(parsed.data.password),
        createdBy: session.username ?? "courier",
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        createdBy: true,
      },
    });

    return NextResponse.json(
      {
        courier: {
          ...created,
          createdAt: created.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create courier";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
