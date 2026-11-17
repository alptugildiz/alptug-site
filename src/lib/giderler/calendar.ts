const pad = (n: number) => String(n).padStart(2, "0");

/** Days of a YYYY-MM month as YYYY-MM-DD, with leading nulls so index 0 is a Monday. */
export function calendarDays(month: string): (string | null)[] {
  const [y, m] = month.split("-").map(Number);
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: count }, (_, i) => `${month}-${pad(i + 1)}`),
  ];
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}
