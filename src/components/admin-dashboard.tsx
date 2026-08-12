"use client";

import { Button, Checkbox, Label } from "@heroui/react";
import {
  Download,
  Eye,
  ScrollText,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminLogoutButton } from "@/components/admin-logout-button";
import { CourierManager, type CourierRow } from "@/components/courier-manager";
import type { AdminRole } from "@/lib/roles";
import { ROLE_META, roleCan } from "@/lib/roles";
import type { CapsuleMeta } from "@/lib/capsules";
import { EVENT } from "@/lib/event";

type AdminCapsule = CapsuleMeta & { bodyHtml?: string | null };

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type Tab = "sealed" | "opened";

export function AdminDashboard({
  role,
  initialCapsules,
  initialCouriers = [],
}: {
  role: AdminRole;
  initialCapsules: AdminCapsule[];
  initialCouriers?: CourierRow[];
}) {
  const router = useRouter();
  const meta = ROLE_META[role];
  const [capsules, setCapsules] = useState(initialCapsules);
  const [selected, setSelected] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>("sealed");
  const [unlockAt, setUnlockAt] = useState<string>(EVENT.defaultUnlockLocalInput);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [peek, setPeek] = useState<AdminCapsule | null>(null);

  const sealed = useMemo(() => capsules.filter((c) => c.isLocked), [capsules]);
  const opened = useMemo(() => capsules.filter((c) => !c.isLocked), [capsules]);
  const visible = tab === "sealed" ? sealed : opened;
  const xp = capsules.length * 10;

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
      a.download = `bunny-radio-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage(`Quest complete! Exported ${selected.length || capsules.length} capsule(s).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }

  async function importFile() {
    if (!file || !unlockAt) {
      setError("Pick a JSON loot file and an unlock date.");
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
      setMessage(
        `Import quest done! ${data.imported} capsule(s) unlock at ${formatDate(data.unlockAt)}.`,
      );
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
    if (!window.confirm("Banish this capsule forever?")) return;
    setDeletingId(id);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/capsules/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setCapsules((prev) => prev.filter((c) => c.id !== id));
      setSelected((prev) => prev.filter((x) => x !== id));
      if (peek?.id === id) setPeek(null);
      setMessage("Capsule banished from the vault.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="game-panel relative overflow-hidden rounded-[1.75rem] border-2 border-pink-300 bg-gradient-to-br from-pink-50 via-white to-rose-100 p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-pink-300/30 blur-2xl" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1 rounded-full bg-pink-500 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-md shadow-pink-400/40">
              <Sparkles className="h-3 w-3" />
              Player class
            </p>
            <h1 className="mt-3 font-display text-3xl text-pink-950 sm:text-4xl">{meta.title}</h1>
            <p className="mt-1 text-sm text-pink-800/75">{meta.tagline}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {meta.powers.map((power) => (
                <span
                  key={power}
                  className="rounded-lg border border-pink-200 bg-white/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-pink-700"
                >
                  {power.replace("_", " ")}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="min-w-[140px] rounded-2xl border-2 border-pink-200 bg-white/90 px-4 py-3 text-right shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-pink-500">Vault XP</p>
              <p className="font-display text-2xl text-pink-950">{xp}</p>
              <p className="text-xs text-pink-700/60">{capsules.length} capsules logged</p>
            </div>
            <AdminLogoutButton label="Log out" />
          </div>
        </div>
      </div>

      {roleCan(role, "manage_couriers") ? (
        <CourierManager initialCouriers={initialCouriers} />
      ) : null}

      {roleCan(role, "import") ? (
        <section className="game-panel rounded-[1.75rem] border-2 border-fuchsia-200 bg-white/80 p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-fuchsia-600" />
            <h2 className="font-display text-xl text-pink-950">Quest: Schedule unlock</h2>
          </div>
          <p className="mb-4 text-sm text-pink-800/70">
            Import encrypted loot and set the {EVENT.unlockOnLabel} date (default Aug 12, 2027).
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Unlock date & time</Label>
              <input
                type="datetime-local"
                value={unlockAt}
                onChange={(e) => setUnlockAt(e.target.value)}
                className="block w-full rounded-xl border-2 border-pink-200 bg-white px-3 py-2 text-sm text-pink-950"
              />
            </div>
            <div className="space-y-2">
              <Label>Encrypted JSON loot</Label>
              <input
                type="file"
                accept="application/json,.json"
                className="block w-full rounded-xl border-2 border-pink-200 bg-white px-3 py-2 text-sm"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <Button className="mt-4" isPending={busy} onPress={importFile}>
            <Upload className="h-4 w-4" />
            Import & arm unlock
          </Button>
        </section>
      ) : null}

      <section className="game-panel rounded-[1.75rem] border-2 border-pink-300 bg-white/80 p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl text-pink-950">Capsule board</h2>
          <div className="flex flex-wrap gap-2">
            {roleCan(role, "export") ? (
              <>
                <Button variant="secondary" onPress={toggleAll}>
                  {allSelected ? "Clear picks" : "Pick all in tab"}
                </Button>
                <Button isPending={busy} onPress={exportSelected}>
                  <Download className="h-4 w-4" />
                  Export {selected.length ? `(${selected.length})` : "all"}
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <div className="mb-4 inline-flex rounded-2xl border-2 border-pink-200 bg-pink-50/80 p-1">
          <button
            type="button"
            onClick={() => setTab("sealed")}
            className={`rounded-xl px-4 py-1.5 text-sm font-black transition ${
              tab === "sealed" ? "bg-pink-500 text-white shadow" : "text-pink-800/70"
            }`}
          >
            Sealed ({sealed.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("opened")}
            className={`rounded-xl px-4 py-1.5 text-sm font-black transition ${
              tab === "opened" ? "bg-pink-500 text-white shadow" : "text-pink-800/70"
            }`}
          >
            Opened ({opened.length})
          </button>
        </div>

        {!roleCan(role, "view_sealed") ? (
          <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Courier mode: you can export & delete, but sealed message contents stay hidden.
          </p>
        ) : (
          <p className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            Vault access: tap Peek to read sealed messages before the anniversary.
          </p>
        )}

        <div className="space-y-2">
          {visible.map((capsule) => (
            <div
              key={capsule.id}
              className="flex items-center gap-2 rounded-2xl border-2 border-pink-100 bg-gradient-to-r from-pink-50/90 to-white px-3 py-3"
            >
              <div className="min-w-0 flex-1">
                {roleCan(role, "export") ? (
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
                      <CapsuleSummary capsule={capsule} />
                    </Checkbox.Content>
                  </Checkbox>
                ) : (
                  <CapsuleSummary capsule={capsule} />
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                {roleCan(role, "view_sealed") ? (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="secondary"
                    onPress={() => setPeek(capsule)}
                    aria-label="Peek message"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                ) : null}
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
            </div>
          ))}
          {visible.length === 0 ? (
            <p className="text-sm text-pink-800/70">
              {tab === "sealed" ? "No sealed capsules on this board." : "No opened capsules yet."}
            </p>
          ) : null}
        </div>
      </section>

      {message ? (
        <p className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-2xl border-2 border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}

      {peek ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pink-950/40 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-[1.75rem] border-2 border-pink-300 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 px-5 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-pink-600">
                  {peek.categoryLabel}
                </p>
                <h3 className="font-display text-2xl text-pink-950">
                  {peek.authorName?.trim() || "Anonymous member"}
                </h3>
                <p className="text-xs text-pink-800/60">
                  {peek.isLocked ? "SEALED — private peek" : "OPENED"} · {formatDate(peek.createdAt)}
                </p>
              </div>
              <Button isIconOnly variant="ghost" onPress={() => setPeek(null)} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-5 py-5">
              {peek.bodyHtml ? (
                <div
                  className="prose-capsule text-pink-950/90"
                  dangerouslySetInnerHTML={{ __html: peek.bodyHtml }}
                />
              ) : (
                <p className="text-sm text-pink-800/70">No message body available.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CapsuleSummary({ capsule }: { capsule: AdminCapsule }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate font-bold text-pink-950">
        {capsule.authorName?.trim() || "Anonymous member"}
      </p>
      <p className="text-xs text-pink-800/60">
        {capsule.categoryLabel} · Created {formatDate(capsule.createdAt)} · Unlock{" "}
        {formatDate(capsule.unlockAt)} · {capsule.isLocked ? "Sealed" : "Opened"}
      </p>
    </div>
  );
}
