import type Lenis from "lenis";

/** Clears the sticky nav when jumping to a section. */
export const NAV_OFFSET = -72;

let instance: Lenis | null = null;

export function registerLenis(lenis: Lenis | null) {
  instance = lenis;
}

/** Scrolls through Lenis when it's running so smooth scrolling and ScrollTrigger stay in sync. */
export function scrollToSection(id: string) {
  const el = id === "top" ? null : document.getElementById(id);
  if (instance) {
    instance.scrollTo(el ?? 0, { offset: el ? NAV_OFFSET : 0 });
    return;
  }
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + NAV_OFFSET });
  else window.scrollTo({ top: 0 });
}

/** Freezes smooth scrolling while a modal is open. */
export function lockScroll(locked: boolean) {
  if (locked) instance?.stop();
  else instance?.start();
}
