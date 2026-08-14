"use client";

import { Button, Input, Label, TextField } from "@heroui/react";
import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CapsuleEditor } from "@/components/capsule-editor";
import {
  EVENT,
  MESSAGE_CATEGORIES,
  type MessageCategoryId,
} from "@/lib/event";

const DEFAULT_SEAL_VIDEO = "/bunny_sealing_a_message_in_a_c.mp4";

function sealVideoForCategory(category: MessageCategoryId) {
  if (category === "to_owner") return "/to_athena.mp4";
  if (category === "wish") return "/wish2.mp4";
  return DEFAULT_SEAL_VIDEO;
}

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
  const [sealVideoSrc, setSealVideoSrc] = useState(DEFAULT_SEAL_VIDEO);
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
        fallbackTimer = setTimeout(goNext, 1800);
      });
      video.addEventListener("ended", onEnded);
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
      setSealVideoSrc(sealVideoForCategory(category));
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
      <section id="create" className="relative mx-auto w-full max-w-xl animate-rise">
        <div className="rounded-3xl border border-pink-200/70 bg-white/80 p-5 text-center sm:p-6">
          <h2 className="font-display text-xl text-pink-950">Sealing…</h2>
          <div className="mt-4 overflow-hidden rounded-2xl bg-pink-50">
            <video
              ref={videoRef}
              key={sealVideoSrc}
              src={sealVideoSrc}
              className="aspect-video w-full object-cover"
              autoPlay
              muted
              playsInline
              preload="auto"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="create" className="relative mx-auto w-full max-w-xl animate-rise">
      <div className="rounded-3xl border border-pink-200/70 bg-white/75 p-5 sm:p-6">
        <h2 className="font-display text-xl text-pink-950">Leave a message</h2>
        <p className="mt-1 text-sm text-pink-800/65">Opens on the {EVENT.unlockOnLabel}.</p>

        <div className="mt-5 space-y-4">
          <TextField fullWidth name="authorName" value={authorName} onChange={setAuthorName}>
            <Label>Name</Label>
            <Input placeholder="Optional" />
          </TextField>

          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="flex flex-wrap gap-1.5">
              {MESSAGE_CATEGORIES.map((item) => {
                const selected = category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    className={`rounded-full px-3 py-1 text-sm transition ${
                      selected
                        ? "bg-pink-500 font-semibold text-white"
                        : "bg-pink-100/80 text-pink-800 hover:bg-pink-200/80"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-pink-800/60">
              {MESSAGE_CATEGORIES.find((item) => item.id === category)?.hint}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Message</Label>
            <CapsuleEditor key={editorKey} value={bodyHtml} onChange={setBodyHtml} />
          </div>

          {error ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          ) : null}

          <Button fullWidth isPending={pending} onPress={onSubmit}>
            <LockKeyhole className="h-4 w-4" />
            Seal
          </Button>
        </div>
      </div>
    </section>
  );
}
