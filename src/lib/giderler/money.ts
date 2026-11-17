const MAX_KURUS = 100_000_000_00;

const formatter = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });

/** "1.250,50" | "89,90" | "1250.5" → kuruş; null for anything that isn't a positive amount with ≤2 decimals. */
export function parseAmount(input: string): number | null {
  let s = input.trim();
  if (s.includes(".") && s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;

  const kurus = Math.round(Number(s) * 100);
  return kurus > 0 && kurus <= MAX_KURUS ? kurus : null;
}

export function formatTRY(kurus: number): string {
  return formatter.format(kurus / 100);
}
