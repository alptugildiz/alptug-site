"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { sections } from "@/content/nav";
import { profile } from "@/content/resume";
import { lockScroll, scrollToSection } from "@/lib/scroll";

type Command = {
  id: string;
  group: "Navigate" | "Contact" | "Play";
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void | string; // a returned string is shown as feedback and keeps the palette open
};

export const ARCADE_SELECT = "arcade:select";

const playGame = (id: string) => {
  scrollToSection("console");
  window.dispatchEvent(new CustomEvent(ARCADE_SELECT, { detail: id }));
};

const COMMANDS: Command[] = [
  ...sections.map<Command>((s) => ({
    id: `go-${s.id}`,
    group: "Navigate",
    label: `Go to ${s.label === "Log" ? "Experience" : s.label}`,
    hint: s.index,
    keywords: `${s.id} section`,
    run: () => scrollToSection(s.id),
  })),
  { id: "go-top", group: "Navigate", label: "Back to top", hint: "000", keywords: "home hero start", run: () => scrollToSection("top") },
  {
    id: "copy-email",
    group: "Contact",
    label: "Copy email address",
    hint: profile.email,
    keywords: "mail contact",
    run: () => {
      navigator.clipboard?.writeText(profile.email).catch(() => {});
      return `Copied ${profile.email}`;
    },
  },
  { id: "email", group: "Contact", label: "Send an email", hint: "↗", keywords: "mail contact", run: () => void (window.location.href = `mailto:${profile.email}`) },
  { id: "github", group: "Contact", label: "Open GitHub", hint: "↗", keywords: "code source repo", run: () => void window.open(profile.github, "_blank", "noopener") },
  { id: "linkedin", group: "Contact", label: "Open LinkedIn", hint: "↗", keywords: "profile work", run: () => void window.open(profile.linkedin, "_blank", "noopener") },
  { id: "play-life", group: "Play", label: "Watch Game of Life", keywords: "conway arcade game", run: () => playGame("life") },
  { id: "play-snake", group: "Play", label: "Play Snake", keywords: "arcade game", run: () => playGame("snake") },
  { id: "play-breakout", group: "Play", label: "Play Breakout", keywords: "arcade game bricks", run: () => playGame("breakout") },
  { id: "play-pong", group: "Play", label: "Play Pong", keywords: "arcade game tennis", run: () => playGame("pong") },
];

/** Case-insensitive subsequence match; lower score is better, -1 is no match. */
function score(query: string, text: string) {
  if (!query) return 0;
  const q = query.toLowerCase(), t = text.toLowerCase();
  const direct = t.indexOf(q);
  if (direct !== -1) return direct;
  let ti = 0, gaps = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found === -1) return -1;
    gaps += found - ti;
    ti = found + 1;
  }
  return 100 + gaps;
}

const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const noop = () => () => {};

/** Ctrl/⌘+K command palette built on a native <dialog> (focus trap and Esc come for free). */
export default function CommandPalette() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const mac = useSyncExternalStore(noop, isMac, () => false);

  const results = useMemo(
    () =>
      COMMANDS.map((c) => ({ c, s: score(query, `${c.label} ${c.keywords ?? ""} ${c.group}`) }))
        .filter((r) => r.s !== -1)
        .sort((a, b) => a.s - b.s)
        .map((r) => r.c),
    [query],
  );

  const open = () => {
    const d = dialogRef.current;
    if (!d || d.open) return;
    setQuery("");
    setCursor(0);
    setFeedback(null);
    d.showModal();
    lockScroll(true);
    inputRef.current?.focus();
  };
  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const execute = (cmd: Command | undefined) => {
    if (!cmd) return;
    lockScroll(false); // a stopped Lenis ignores scrollTo, so release it before running the command
    const result = cmd.run();
    if (typeof result === "string") {
      lockScroll(true);
      setFeedback(result);
    } else close();
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      execute(results[cursor]);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        className="hud-label flex items-center gap-2 px-3 text-xs text-cream-dim transition-colors hover:bg-cream hover:text-ink sm:px-4"
      >
        <span className="hidden md:inline">Menu</span>
        <kbd className="rounded-[4px] border border-current px-1.5 py-0.5 font-mono text-[10px] leading-none">
          {mac ? "⌘" : "Ctrl"} K
        </kbd>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Command menu"
        onClick={(e) => e.target === dialogRef.current && close()} // click on the backdrop
        onClose={() => {
          setQuery("");
          lockScroll(false);
        }}
        data-lenis-prevent
        className="mx-auto mt-[12vh] w-[min(560px,calc(100vw-32px))] overflow-hidden rounded-[var(--radius-panel)] border border-line bg-ink p-0 text-cream shadow-[0_24px_80px_rgb(0_0_0/0.6)] backdrop:bg-ink/70 backdrop:backdrop-blur-[2px]"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <span aria-hidden className="font-mono text-signal">&gt;</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
              setFeedback(null);
            }}
            onKeyDown={onInputKey}
            placeholder="Type a command or search…"
            aria-label="Search commands"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-list"
            aria-activedescendant={results[cursor] ? `cmd-${results[cursor].id}` : undefined}
            className="h-14 flex-1 bg-transparent font-mono text-sm text-cream outline-none placeholder:text-cream-mute focus-visible:outline-none"
          />
          <kbd className="hud-label rounded-[4px] border border-line px-1.5 py-0.5 text-[10px] text-cream-mute">Esc</kbd>
        </div>

        <ul ref={listRef} id="command-list" role="listbox" aria-label="Commands" className="max-h-[50vh] overflow-y-auto py-2">
          {results.length === 0 && <li className="px-4 py-6 text-center text-sm text-cream-mute">No commands match “{query}”.</li>}
          {results.map((c, i) => {
            // group headers only make sense in the default order; ranked results mix groups
            const header = !query && (i === 0 || results[i - 1].group !== c.group);
            const on = i === cursor;
            return (
              <li key={c.id} role="presentation">
                {header && <p className="hud-label px-4 pt-3 pb-1.5 text-[10px] text-cream-mute">{c.group}</p>}
                <div
                  id={`cmd-${c.id}`}
                  role="option"
                  aria-selected={on}
                  onMouseMove={() => setCursor(i)}
                  onClick={() => execute(c)}
                  className={`mx-2 flex cursor-pointer items-center justify-between gap-4 rounded-[6px] px-3 py-2.5 text-sm ${
                    on ? "bg-cream text-ink" : "text-cream-dim"
                  }`}
                >
                  <span>{c.label}</span>
                  {c.hint && <span className={`truncate font-mono text-xs ${on ? "text-ink/60" : "text-cream-mute"}`}>{c.hint}</span>}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="hud-label flex items-center justify-between gap-4 border-t border-line px-4 py-2.5 text-[10px] text-cream-mute">
          <span aria-live="polite" className={feedback ? "text-signal" : ""}>
            {feedback ?? "↑↓ navigate · ↵ run"}
          </span>
          <span>{results.length} commands</span>
        </div>
      </dialog>
    </>
  );
}
