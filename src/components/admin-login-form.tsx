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
    <div className="mx-auto w-full max-w-md rounded-[2rem] border border-pink-200/80 bg-white/75 p-8 shadow-xl backdrop-blur">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-2xl bg-pink-500/10 p-3 text-pink-600">
          <KeyRound className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-pink-950">Admin login</h1>
          <p className="text-sm text-pink-800/65">Export and import encrypted capsules</p>
        </div>
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

        {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <Button fullWidth isPending={pending} onPress={onSubmit}>
          Sign in
        </Button>
      </div>
    </div>
  );
}
