"use client";

import { Button, Input, Label, TextField } from "@heroui/react";
import { Trash2, UserPlus } from "lucide-react";
import { useState } from "react";

export type CourierRow = {
  id: string;
  username: string;
  createdAt: string;
  createdBy: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CourierManager({ initialCouriers }: { initialCouriers: CourierRow[] }) {
  const [couriers, setCouriers] = useState(initialCouriers);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createCourier() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/couriers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add courier");
      setCouriers((prev) => [data.courier, ...prev]);
      setUsername("");
      setPassword("");
      setMessage(`Courier “${data.courier.username}” recruited. Share the password securely.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add courier");
    } finally {
      setBusy(false);
    }
  }

  async function removeCourier(id: string, name: string) {
    if (!window.confirm(`Remove courier “${name}”?`)) return;
    setDeletingId(id);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/couriers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not remove courier");
      setCouriers((prev) => prev.filter((c) => c.id !== id));
      setMessage(`Courier “${name}” removed.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove courier");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="game-panel rounded-[1.75rem] border-2 border-pink-300 bg-white/80 p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-pink-600" />
        <h2 className="font-display text-xl text-pink-950">Recruit couriers</h2>
      </div>
      <p className="mb-4 text-sm text-pink-800/70">
        Add another Capsule Courier. They can export JSON and delete capsules — not peek sealed notes.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <TextField fullWidth name="courierUsername" value={username} onChange={setUsername}>
          <Label>New username</Label>
          <Input placeholder="courier2" autoComplete="off" />
        </TextField>
        <TextField
          fullWidth
          name="courierPassword"
          type="password"
          value={password}
          onChange={setPassword}
        >
          <Label>Temporary password</Label>
          <Input placeholder="min 6 characters" autoComplete="new-password" />
        </TextField>
      </div>
      <Button className="mt-4" isPending={busy} onPress={createCourier}>
        <UserPlus className="h-4 w-4" />
        Add courier
      </Button>

      <div className="mt-5 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-pink-600">
          Recruited couriers ({couriers.length})
        </p>
        {couriers.length === 0 ? (
          <p className="text-sm text-pink-800/65">No extra couriers yet — only the main env account.</p>
        ) : (
          couriers.map((courier) => (
            <div
              key={courier.id}
              className="flex items-center justify-between gap-3 rounded-2xl border-2 border-pink-100 bg-pink-50/50 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate font-bold text-pink-950">{courier.username}</p>
                <p className="text-xs text-pink-800/60">
                  Added {formatDate(courier.createdAt)}
                  {courier.createdBy ? ` · by ${courier.createdBy}` : ""}
                </p>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="danger-soft"
                isPending={deletingId === courier.id}
                onPress={() => removeCourier(courier.id, courier.username)}
                aria-label={`Remove ${courier.username}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {message ? (
        <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </section>
  );
}
