// shared Tailwind class strings for the giderler forms
export const field =
  "w-full rounded-md border border-line-soft bg-ink px-3 py-2 font-mono text-sm text-cream placeholder:text-cream-mute focus:border-cream";
export const label = "hud-label mb-1.5 block text-[11px] text-cream-dim";
export const button =
  "hud-label rounded-md border border-line px-4 py-2.5 text-xs text-cream transition-colors hover:bg-cream hover:text-ink disabled:opacity-50";
export const primaryButton =
  "hud-label rounded-md bg-signal px-4 py-2.5 text-xs text-ink transition-opacity hover:opacity-85 disabled:opacity-50";
export const errorText = "font-mono text-xs text-[#ff8a7a]";
/** <select> styled to match; the open list is styled via base-select in giderler.css */
export const select = `${field} hud-select`;
