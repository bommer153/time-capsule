import sanitizeHtml from "sanitize-html";

const MAX_BODY_CHARS = 12_000_000; // ~keep under MongoDB 16MB with headroom
const MAX_IMAGE_DATA_URL_CHARS = 1_800_000; // ~1.3MB binary after base64

export function sanitizeCapsuleHtml(dirty: string): string {
  if (dirty.length > MAX_BODY_CHARS) {
    throw new Error("Message is too large. Try fewer or smaller images.");
  }

  const clean = sanitizeHtml(dirty, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "h1",
      "h2",
      "span",
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "class"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
      a: ["http", "https", "mailto"],
    },
    allowProtocolRelative: false,
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
