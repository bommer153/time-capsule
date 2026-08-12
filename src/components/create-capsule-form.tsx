"use client";

import { Button, Input, Label, TextField } from "@heroui/react";
import { LockKeyhole, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CapsuleEditor } from "@/components/capsule-editor";
import {
  EVENT,
  MESSAGE_CATEGORIES,
  type MessageCategoryId,
} from "@/lib/event";

const SEAL_VIDEO_SRC = "/bunny_sealing_a_message_in_a_c.mp4";

export function CreateCapsuleForm() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [authorName, setAuthorName] = useState("");
  const [category, setCategory] = useState<MessageCategoryId>("message");
  const [bodyHtml, setBodyHtml] = useState("<p></p>");
  const [editorKey, setEditorKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sealing, setSealing] = useState(false);
  const [nextId, setNextId] = useState<string | null>(null);

  useEffect(() => {
    if (!sealing || !nextId) return;

    const video = videoRef.current;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    let navigated = false;

    const goNext = () => {
      if (navigated) return;
      navigated = true;
      router.refresh();
      router.push(`/capsules/${nextId}`);
    };

    const onEnded = () => goNext();

    if (video) {
      video.currentTime = 0;
      void video.play().catch(() => {
        // Autoplay blocked — still advance after a short beat
        fallbackTimer = setTimeout(goNext, 1800);
      });
      video.addEventListener("ended", onEnded);
      // Safety if metadata never fires ended
      fallbackTimer = setTimeout(goNext, 20000);
    } else {
      fallbackTimer = setTimeout(goNext, 1800);
    }

    return () => {
      video?.removeEventListener("ended", onEnded);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [sealing, nextId, router]);

  async function onSubmit() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/capsules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: authorName.trim() || null,
          category,
          bodyHtml,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not seal capsule");
      }
      setAuthorName("");
      setCategory("message");
      setBodyHtml("<p></p>");
      setEditorKey((k) => k + 1);
      setNextId(data.capsule.id);
      setSealing(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPending(false);
    }
  }

  if (sealing) {
    return (
      <section id="create" className="relative mx-auto w-full max-w-2xl animate-rise">
        <div className="rounded-[2rem] border border-pink-200/70 bg-white/80 p-6 text-center shadow-[0_20px_60px_-30px_rgba(236,72,153,0.55)] backdrop-blur-md sm:p-8">
          <h2 className="font-display text-2xl text-pink-950 sm:text-3xl">Bunny is sealing it…</h2>
          <p className="mt-2 text-sm text-pink-800/70">
            Your note is going into the capsule until {EVENT.unlockOnLabel}.
          </p>
          <div className="mt-5 overflow-hidden rounded-3xl border border-pink-200/80 bg-pink-50 shadow-inner">
            <video
              ref={videoRef}
              src={SEAL_VIDEO_SRC}
              className="aspect-video w-full object-cover"
              autoPlay
              muted
              playsInline
              preload="auto"
            />
          </div>
          <p className="mt-3 text-xs text-pink-700/60">Hang tight — hopping you to the sealed page next.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="create" className="relative mx-auto w-full max-w-2xl animate-rise">
      <div className="rounded-[2rem] border border-pink-200/70 bg-white/70 p-6 shadow-[0_20px_60px_-30px_rgba(236,72,153,0.55)] backdrop-blur-md sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-2xl bg-pink-500/10 p-3 text-pink-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-pink-950 sm:text-3xl">Seal your anniversary note</h2>
            <p className="mt-1 text-sm text-pink-900/70">
              No login needed. Your message opens on Bunny Radio&apos;s {EVENT.unlockOnLabel}{" "}
              (Aug 12, 2027) after admin import.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <TextField fullWidth name="authorName" value={authorName} onChange={setAuthorName}>
            <Label>Your name (optional)</Label>
            <Input placeholder="Bunny Radio member" />
          </TextField>

          <div className="space-y-2">
            <Label>What kind of message?</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {MESSAGE_CATEGORIES.map((item) => {
                const selected = category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    className={`rounded-2xl border px-3 py-3 text-left transition ${
                      selected
                        ? "border-pink-400 bg-pink-500 text-white shadow-md shadow-pink-300/40"
                        : "border-pink-200 bg-white/80 text-pink-950 hover:border-pink-300 hover:bg-pink-50"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span
                      className={`mt-0.5 block text-xs ${selected ? "text-pink-50/90" : "text-pink-800/55"}`}
                    >
                      {item.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Your message</Label>
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
            Seal until 3rd anniversary
          </Button>
        </div>
      </div>
    </section>
  );
}
