import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";

import { SiteHeader } from "@/components/site-header";

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
    default: "Time Capsule",
    template: "%s · Time Capsule",
  },
  description: "Seal a message for later. Export encrypted JSON. Import to unlock on a chosen date.",
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
            Messages stay sealed until an admin imports them with an unlock date.
          </footer>
        </div>
      </body>
    </html>
  );
}
