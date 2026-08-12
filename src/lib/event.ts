export const EVENT = {
  brand: "Bunny Radio",
  title: "Bunny Radio Time Capsule",
  anniversaryYear: 2,
  unlockAnniversaryYear: 3,
  sealedOnLabel: "2nd Founding Anniversary",
  unlockOnLabel: "3rd Founding Anniversary",
  /** Opens on 3rd anniversary — Aug 12, 2027 local midnight */
  defaultUnlockAt: new Date("2027-08-12T00:00:00"),
  defaultUnlockLocalInput: "2027-08-12T00:00",
} as const;

export const MESSAGE_CATEGORIES = [
  { id: "to_owner", label: "To the owner", hint: "A note for Bunny Radio’s owner" },
  { id: "to_colleague", label: "To a colleague", hint: "For teammates and co-hosts" },
  { id: "message", label: "Message", hint: "A general sealed note" },
  { id: "memory", label: "Memory", hint: "A moment worth keeping" },
  { id: "thank_you", label: "Thank you", hint: "Gratitude you want to save" },
  { id: "wish", label: "Wish", hint: "Hopes for Bunny Radio" },
  { id: "prediction", label: "Prediction", hint: "What you think will happen" },
  { id: "future", label: "Future of Bunny Radio", hint: "Where we’re headed next" },
] as const;

export type MessageCategoryId = (typeof MESSAGE_CATEGORIES)[number]["id"];

export const MESSAGE_CATEGORY_IDS = MESSAGE_CATEGORIES.map((c) => c.id) as [
  MessageCategoryId,
  ...MessageCategoryId[],
];

export function getCategoryLabel(id: string | null | undefined) {
  return MESSAGE_CATEGORIES.find((c) => c.id === id)?.label ?? "Message";
}

export function formatUnlockLocalInput(date = EVENT.defaultUnlockAt) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
