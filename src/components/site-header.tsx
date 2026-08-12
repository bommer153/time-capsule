import Link from "next/link";
import { Hourglass } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
      <Link href="/" className="group flex items-center gap-2">
        <span className="rounded-2xl bg-pink-500 p-2 text-white shadow-lg shadow-pink-400/40 transition group-hover:rotate-6">
          <Hourglass className="h-5 w-5" />
        </span>
        <span className="font-display text-2xl tracking-tight text-pink-950">Time Capsule</span>
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link
          href="/#create"
          className="rounded-full px-3 py-1.5 text-pink-900/80 transition hover:bg-pink-100/80 hover:text-pink-950"
        >
          Seal one
        </Link>
        <Link
          href="/admin"
          className="rounded-full bg-pink-500/10 px-3 py-1.5 font-medium text-pink-700 transition hover:bg-pink-500/20"
        >
          Admin
        </Link>
      </nav>
    </header>
  );
}
