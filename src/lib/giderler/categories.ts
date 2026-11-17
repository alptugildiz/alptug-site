export const CATEGORIES = [
  { id: "ulasim", label: "Ulaşım" },
  { id: "kozmetik", label: "Kozmetik" },
  { id: "yemek", label: "Yemek" },
  { id: "faturalar", label: "Faturalar" },
  { id: "psikolog", label: "Psikolog" },
  { id: "spor", label: "Spor" },
  { id: "tatli", label: "Tatlı / abur cubur" },
  { id: "ev", label: "Ev giderleri" },
  { id: "giyim", label: "Giyim" },
  { id: "diger", label: "Diğer" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function isCategory(x: unknown): x is CategoryId {
  return CATEGORIES.some((c) => c.id === x);
}

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export const USERS = { alptug: "Alptuğ", gamze: "Gamze" } as const;

export type UserId = keyof typeof USERS;

export function isUser(x: unknown): x is UserId {
  return typeof x === "string" && Object.hasOwn(USERS, x);
}
