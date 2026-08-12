"use client";

import { Button, Input, Label, TextField } from "@heroui/react";
import { LockKeyhole, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CapsuleEditor } from "@/components/capsule-editor";

export function CreateCapsuleForm() {
  const router = useRouter();
  const [authorName, setAuthorName] = useState("");
  const [bodyHtml, setBodyHtml] = useState("<p></p>");
  const [editorKey, setEditorKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/capsules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: authorName.trim() || null,
          bodyHtml,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not seal capsule");
      }
      setAuthorName("");
      setBodyHtml("<p></p>");
      setEditorKey((k) => k + 1);
      router.refresh();
      router.push(`/capsules/${data.capsule.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <section id="create" className="relative mx-auto w-full max-w-2xl animate-rise">
      <div className="rounded-[2rem] border border-pink-200/70 bg-white/70 p-6 shadow-[0_20px_60px_-30px_rgba(236,72,153,0.55)] backdrop-blur-md sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-2xl bg-pink-500/10 p-3 text-pink-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-pink-950 sm:text-3xl">Seal a message</h2>
            <p className="mt-1 text-sm text-pink-900/70">
              No login needed. Your note stays locked until an admin imports it with an unlock date.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <TextField fullWidth name="authorName" value={authorName} onChange={setAuthorName}>
            <Label>Your name (optional)</Label>
            <Input placeholder="Anonymous dreamer" />
          </TextField>

          <div className="space-y-2">
            <Label>Message</Label>
            <CapsuleEditor key={editorKey} value={bodyHtml} onChange={setBodyHtml} />
          </div>

          {error ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          ) : null}

          <Button
            fullWidth
            size="lg"
            isPending={pending}
            onPress={onSubmit}
            className="font-semibold"
          >
            <LockKeyhole className="h-4 w-4" />
            Seal time capsule
          </Button>
        </div>
      </div>
    </section>
  );
}
