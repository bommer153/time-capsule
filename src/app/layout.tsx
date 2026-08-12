import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import { EVENT } from "@/lib/event";

import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: {
    default: EVENT.title,
    template: `%s · ${EVENT.brand}`,
  },
  description:
    "Bunny Radio 2nd founding anniversary time capsule — seal messages to open on the 3rd anniversary.",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/bunny_logo-transparent.png", type: "image/png" },
    ],
    apple: [{ url: "/bunny-logo-512.png", sizes: "512x512", type: "image/png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} ${fraunces.variable} h-full`}>
      <body className="pink-aurora relative min-h-full antialiased">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative flex min-h-full flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="px-6 py-8 text-center text-xs text-pink-900/50">
            {EVENT.brand} · Sealed on the {EVENT.sealedOnLabel} · Opens on the {EVENT.unlockOnLabel}{" "}
            (Aug 12, 2027)
          </footer>
        </div>
      </body>
    </html>
  );
}
