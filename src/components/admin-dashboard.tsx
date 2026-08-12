"use client";

import { Button, Checkbox, Label } from "@heroui/react";
import { Download, LogOut, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { CapsuleMeta } from "@/lib/capsules";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminDashboard({ initialCapsules }: { initialCapsules: CapsuleMeta[] }) {
  const router = useRouter();
  const [capsules, setCapsules] = useState(initialCapsules);
  const [selected, setSelected] = useState<string[]>([]);
  const [unlockAt, setUnlockAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const allSelected = useMemo(
    () => capsules.length > 0 && selected.length === capsules.length,
    [capsules.length, selected.length],
  );

  function toggleAll() {
    setSelected(allSelected ? [] : capsules.map((c) => c.id));
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function exportSelected() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected.length ? selected : undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `time-capsule-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage(`Exported ${selected.length || capsules.length} capsule(s) as encrypted JSON.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }

  async function importFile() {
    if (!file || !unlockAt) {
      setError("Choose a JSON file and an unlock date.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("unlockAt", new Date(unlockAt).toISOString());
      const res = await fetch("/api/admin/import", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setMessage(`Imported ${data.imported} capsule(s). They unlock at ${formatDate(data.unlockAt)}.`);
      setFile(null);
      const listRes = await fetch("/api/admin/capsules");
      const listData = await listRes.json();
      if (listRes.ok) setCapsules(listData.capsules);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-pink-950">Admin vault</h1>
          <p className="text-sm text-pink-800/70">Export sealed capsules or import them with an unlock date.</p>
        </div>
        <Button variant="outline" onPress={logout}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>

      <section className="rounded-3xl border border-pink-200/80 bg-white/70 p-5 backdrop-blur sm:p-6">
        <h2 className="mb-4 font-display text-xl text-pink-950">Import encrypted JSON</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Unlock date & time</Label>
            <input
              type="datetime-local"
              value={unlockAt}
              onChange={(e) => setUnlockAt(e.target.value)}
              className="block w-full rounded-xl border border-pink-200 bg-white px-3 py-2 text-sm text-pink-950"
            />
          </div>
          <div className="space-y-2">
            <Label>Encrypted JSON file</Label>
            <input
              type="file"
              accept="application/json,.json"
              className="block w-full rounded-xl border border-pink-200 bg-white px-3 py-2 text-sm"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <Button className="mt-4" isPending={busy} onPress={importFile}>
          <Upload className="h-4 w-4" />
          Import & schedule unlock
        </Button>
      </section>

      <section className="rounded-3xl border border-pink-200/80 bg-white/70 p-5 backdrop-blur sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl text-pink-950">Capsules ({capsules.length})</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onPress={toggleAll}>
              {allSelected ? "Clear selection" : "Select all"}
            </Button>
            <Button isPending={busy} onPress={exportSelected}>
              <Download className="h-4 w-4" />
              Export {selected.length ? `(${selected.length})` : "all"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {capsules.map((capsule) => (
            <div
              key={capsule.id}
              className="rounded-2xl border border-pink-100 bg-pink-50/40 px-3 py-3"
            >
              <Checkbox
                isSelected={selected.includes(capsule.id)}
                onChange={(isSelected) => {
                  setSelected((prev) =>
                    isSelected ? [...prev, capsule.id] : prev.filter((x) => x !== capsule.id),
                  );
                }}
              >
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-pink-950">
                      {capsule.authorName?.trim() || "Anonymous"}
                    </p>
                    <p className="text-xs text-pink-800/60">
                      Created {formatDate(capsule.createdAt)} · Unlock {formatDate(capsule.unlockAt)}{" "}
                      · {capsule.isLocked ? "Locked" : "Open"}
                    </p>
                  </div>
                </Checkbox.Content>
              </Checkbox>
            </div>
          ))}
          {capsules.length === 0 ? (
            <p className="text-sm text-pink-800/70">No capsules in the database yet.</p>
          ) : null}
        </div>
      </section>

      {message ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p> : null}
      {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
