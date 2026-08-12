const MAX_BODY_CHARS = 12_000_000; // ~keep under MongoDB 16MB with headroom
const MAX_IMAGE_DATA_URL_CHARS = 1_800_000; // ~1.3MB binary after base64

export async function sanitizeCapsuleHtml(dirty: string): Promise<string> {
  if (dirty.length > MAX_BODY_CHARS) {
    throw new Error("Message is too large. Try fewer or smaller images.");
  }

  const { default: DOMPurify } = await import("isomorphic-dompurify");

  const clean = DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ["img"],
    ADD_ATTR: ["src", "alt", "title", "width", "height", "style", "class"],
    ALLOW_DATA_ATTR: false,
  });

  const dataUrls = clean.match(/src="(data:image\/[^"]+)"/gi) ?? [];
  for (const match of dataUrls) {
    const src = match.slice(5, -1);
    if (!/^data:image\/(png|jpe?g|gif|webp);base64,/i.test(src)) {
      throw new Error("Only PNG, JPEG, GIF, or WebP images are allowed.");
    }
    if (src.length > MAX_IMAGE_DATA_URL_CHARS) {
      throw new Error("An image is too large. Keep each image under ~1.3MB.");
    }
  }

  return clean;
}
