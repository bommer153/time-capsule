import Link from "next/link";

import { AdminLogoutButton } from "@/components/admin-logout-button";
import { EVENT } from "@/lib/event";
import { getAdminSession } from "@/lib/session";

export async function SiteHeader() {
  let isLoggedIn = false;
  try {
    const session = await getAdminSession();
    isLoggedIn = Boolean(session.isAdmin && session.role);
  } catch {
    isLoggedIn = false;
  }

  return (
    <header className="relative z-20 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
      <Link href="/" className="group flex items-center gap-2.5">
        <span className="relative h-12 w-12 overflow-hidden rounded-2xl shadow-lg shadow-pink-400/30 transition group-hover:rotate-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bunny_logo-transparent.png"
            alt={`${EVENT.brand} logo`}
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
          />
        </span>
        <span className="font-display text-2xl tracking-tight text-pink-950">{EVENT.brand}</span>
      </Link>
      <nav className="flex items-center gap-2 text-sm sm:gap-3">
        <Link
          href="/#create"
          className="rounded-full px-3 py-1.5 text-pink-900/80 transition hover:bg-pink-100/80 hover:text-pink-950"
        >
          Leave a note
        </Link>
        {isLoggedIn ? (
          <>
            <Link
              href="/admin"
              className="rounded-full bg-pink-500/10 px-3 py-1.5 font-medium text-pink-700 transition hover:bg-pink-500/20"
            >
              HQ
            </Link>
            <AdminLogoutButton />
          </>
        ) : (
          <Link
            href="/admin"
            className="rounded-full bg-pink-500/10 px-3 py-1.5 font-medium text-pink-700 transition hover:bg-pink-500/20"
          >
            Admin
          </Link>
        )}
      </nav>
    </header>
  );
}
