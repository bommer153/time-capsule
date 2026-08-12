"use client";

import { Button, Checkbox, Label } from "@heroui/react";
import { Download, LogOut, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { CapsuleMeta } from "@/lib/capsules";
import { EVENT } from "@/lib/event";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type Tab = "sealed" | "opened";

export function AdminDashboard({ initialCapsules }: { initialCapsules: CapsuleMeta[] }) {
  const router = useRouter();
  const [capsules, setCapsules] = useState(initialCapsules);
  const [selected, setSelected] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>("sealed");
  const [unlockAt, setUnlockAt] = useState<string>(EVENT.defaultUnlockLocalInput);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sealed = useMemo(() => capsules.filter((c) => c.isLocked), [capsules]);
  const opened = useMemo(() => capsules.filter((c) => !c.isLocked), [capsules]);
  const visible = tab === "sealed" ? sealed : opened;

  const allSelected = useMemo(
    () => visible.length > 0 && visible.every((c) => selected.includes(c.id)),
    [visible, selected],
  );

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !visible.some((c) => c.id === id)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...visible.map((c) => c.id)])));
    }
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

  async function deleteCapsule(id: string) {
    if (!window.confirm("Delete this capsule permanently?")) return;
    setDeletingId(id);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/capsules/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setCapsules((prev) => prev.filter((c) => c.id !== id));
      setSelected((prev) => prev.filter((x) => x !== id));
      setMessage("Capsule deleted.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-pink-950">Admin vault</h1>
          <p className="text-sm text-pink-800/70">
            Export sealed notes, then import with unlock set to the {EVENT.unlockOnLabel} (Aug 12,
            2027).
          </p>
        </div>
        <Button variant="outline" onPress={logout}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>

      <section className="rounded-3xl border border-pink-200/80 bg-white/70 p-5 backdrop-blur sm:p-6">
        <h2 className="mb-4 font-display text-xl text-pink-950">Import for 3rd anniversary</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Unlock date & time (default: Aug 12, 2027)</Label>
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
              {allSelected ? "Clear selection" : "Select all in tab"}
            </Button>
            <Button isPending={busy} onPress={exportSelected}>
              <Download className="h-4 w-4" />
              Export {selected.length ? `(${selected.length})` : "all"}
            </Button>
          </div>
        </div>

        <div className="mb-4 inline-flex rounded-full border border-pink-200 bg-pink-50/60 p-1">
          <button
            type="button"
            onClick={() => setTab("sealed")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tab === "sealed" ? "bg-pink-500 text-white" : "text-pink-800/70"
            }`}
          >
            Sealed ({sealed.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("opened")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tab === "opened" ? "bg-pink-500 text-white" : "text-pink-800/70"
            }`}
          >
            Opened ({opened.length})
          </button>
        </div>

        <div className="space-y-2">
          {visible.map((capsule) => (
            <div
              key={capsule.id}
              className="flex items-center gap-2 rounded-2xl border border-pink-100 bg-pink-50/40 px-3 py-3"
            >
              <div className="min-w-0 flex-1">
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
                        {capsule.authorName?.trim() || "Anonymous member"}
                      </p>
                      <p className="text-xs text-pink-800/60">
                        {capsule.categoryLabel} · Created {formatDate(capsule.createdAt)} · Unlock{" "}
                        {formatDate(capsule.unlockAt)} · {capsule.isLocked ? "Locked" : "Open"}
                      </p>
                    </div>
                  </Checkbox.Content>
                </Checkbox>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="danger-soft"
                isPending={deletingId === capsule.id}
                onPress={() => deleteCapsule(capsule.id)}
                aria-label="Delete capsule"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {visible.length === 0 ? (
            <p className="text-sm text-pink-800/70">
              {tab === "sealed" ? "No sealed capsules in this tab." : "No opened capsules yet."}
            </p>
          ) : null}
        </div>
      </section>

      {message ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p> : null}
      {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
