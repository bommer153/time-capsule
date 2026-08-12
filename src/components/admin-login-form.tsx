"use client";

import { Button, Input, Label, TextField } from "@heroui/react";
import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-4 flex flex-col items-center gap-2 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/bunny_logo-transparent.png"
          alt="Bunny Radio"
          width={72}
          height={72}
          className="h-[72px] w-[72px] object-contain drop-shadow-md"
        />
        <p className="inline-flex items-center rounded-full bg-pink-500 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white">
          Bunny Radio HQ
        </p>
      </div>
      <div className="rounded-[1.75rem] border-2 border-pink-300 bg-gradient-to-b from-white via-pink-50/80 to-rose-100/70 p-8 shadow-[0_20px_50px_-28px_rgba(236,72,153,0.65)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl border-2 border-pink-200 bg-pink-500/10 p-3 text-pink-600">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-pink-950">Capsule Courier</h1>
            <p className="text-sm text-pink-800/65">Staff login · export & manage capsules</p>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-pink-200 bg-white/80 p-3 text-xs text-pink-800/80">
          <p className="font-black text-pink-700">Your powers</p>
          <p className="mt-1">Export encrypted JSON · delete capsules · recruit couriers</p>
        </div>

        <div className="space-y-4">
          <TextField fullWidth name="username" value={username} onChange={setUsername}>
            <Label>Username</Label>
            <Input autoComplete="username" />
          </TextField>
          <TextField
            fullWidth
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
          >
            <Label>Password</Label>
            <Input autoComplete="current-password" />
          </TextField>

          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <Button fullWidth isPending={pending} onPress={onSubmit}>
            Enter HQ
          </Button>
        </div>
      </div>
    </div>
  );
}
