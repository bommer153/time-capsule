import { NextResponse } from "next/server";
import { z } from "zod";

import { ROLE_META, getAdminSession, resolveAdminLogin } from "@/lib/auth";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = loginSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const account = resolveAdminLogin(parsed.data.username, parsed.data.password);
    if (!account) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const session = await getAdminSession();
    session.isAdmin = true;
    session.role = account.role;
    session.username = account.username;
    await session.save();

    return NextResponse.json({
      ok: true,
      role: account.role,
      title: ROLE_META[account.role].title,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
