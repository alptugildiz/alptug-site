"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { calendarDays, shiftMonth } from "@/lib/giderler/calendar.ts";
import { today } from "@/lib/giderler/summary.ts";
import { field, label as labelClass } from "./ui";

type Props = { id: string; name: string; label: string; defaultValue: string };

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("tr-TR", { ...opts, timeZone: "UTC" });
const longDate = fmt({ day: "numeric", month: "long", year: "numeric" });
const shortDate = fmt({ day: "numeric", month: "short", year: "numeric" });
const monthTitle = fmt({ month: "long", year: "numeric" });
const asDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const WEEKDAYS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

function shiftDay(iso: string, delta: number): string {
  const d = asDate(iso);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** Date field with a calendar popover in the site's style; submits YYYY-MM-DD through a hidden input. */
export default function DatePicker({ id, name, label, defaultValue }: Props) {
  const initial = /^\d{4}-\d{2}-\d{2}$/.test(defaultValue) && !Number.isNaN(asDate(defaultValue).getTime()) ? defaultValue : today();
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  // the day keyboard focus sits on; its month is the one shown
  const [active, setActive] = useState(initial);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const month = active.slice(0, 7);
  const todayIso = today();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  useEffect(() => {
    if (open) gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${active}"]`)?.focus();
  }, [open, active]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const pick = (iso: string) => {
    setValue(iso);
    close();
  };

  const onGridKey = (e: KeyboardEvent) => {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in moves) {
      e.preventDefault();
      setActive((a) => shiftDay(a, moves[e.key]));
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      setActive((a) => {
        const target = shiftMonth(a.slice(0, 7), e.key === "PageUp" ? -1 : 1);
        const days = calendarDays(target).filter(Boolean) as string[];
        return days[Math.min(Number(a.slice(8)), days.length) - 1];
      });
    }
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          close();
        }
      }}
    >
      <span id={`${id}-label`} className={labelClass}>
        {label}
      </span>
      <input type="hidden" name={name} value={value} />
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}`}
        onClick={() => {
          setActive(value);
          setOpen((o) => !o);
        }}
        className={`${field} flex items-center justify-between gap-2 text-left`}
      >
        <span className="truncate whitespace-nowrap">{shortDate.format(asDate(value))}</span>
        <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" className="shrink-0 text-cream-dim">
          <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" fill="none" stroke="currentColor" />
          <path d="M1.5 5.5h11M4.5 1v3M9.5 1v3" stroke="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="absolute right-0 top-full z-30 mt-2 w-[17.5rem] rounded-[10px] border border-line bg-ink-2 p-3 shadow-[0_12px_32px_rgb(0_0_0/0.5)] sm:left-0 sm:right-auto"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Önceki ay"
              onClick={() => setActive(shiftMonth(month, -1) + "-01")}
              className="grid size-8 place-items-center rounded-md text-cream-dim hover:bg-line-soft hover:text-cream"
            >
              ‹
            </button>
            <p id={titleId} aria-live="polite" className="hud-label text-xs text-cream capitalize">
              {monthTitle.format(asDate(`${month}-01`))}
            </p>
            <button
              type="button"
              aria-label="Sonraki ay"
              onClick={() => setActive(shiftMonth(month, 1) + "-01")}
              className="grid size-8 place-items-center rounded-md text-cream-dim hover:bg-line-soft hover:text-cream"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center" aria-hidden>
            {WEEKDAYS.map((d) => (
              <span key={d} className="hud-label py-1 text-[10px] text-cream-mute">
                {d}
              </span>
            ))}
          </div>

          <div ref={gridRef} role="grid" aria-labelledby={titleId} onKeyDown={onGridKey} className="grid grid-cols-7 gap-1">
            {calendarDays(month).map((iso, i) =>
              iso ? (
                <button
                  key={iso}
                  type="button"
                  data-day={iso}
                  tabIndex={iso === active ? 0 : -1}
                  aria-pressed={iso === value}
                  aria-current={iso === todayIso ? "date" : undefined}
                  aria-label={longDate.format(asDate(iso))}
                  onClick={() => pick(iso)}
                  className={`h-8 rounded-md font-mono text-xs tabular-nums transition-colors ${
                    iso === value
                      ? "bg-signal text-ink"
                      : iso === todayIso
                        ? "text-signal ring-1 ring-inset ring-line hover:bg-line-soft"
                        : "text-cream hover:bg-line-soft"
                  }`}
                >
                  {Number(iso.slice(8))}
                </button>
              ) : (
                <span key={`blank-${i}`} />
              ),
            )}
          </div>

          <div className="mt-2 flex justify-end border-t border-line-soft pt-2">
            <button
              type="button"
              onClick={() => pick(todayIso)}
              className="hud-label rounded-md px-2 py-1.5 text-[11px] text-cream-dim hover:bg-line-soft hover:text-cream"
            >
              Bugün
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
