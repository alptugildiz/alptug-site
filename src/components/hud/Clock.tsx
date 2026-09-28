"use client";

import { useSyncExternalStore } from "react";

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Istanbul",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function subscribe(cb: () => void) {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
}

const getSnapshot = () => formatter.format(Date.now());
const getServerSnapshot = () => "--:--:--";

/** Live Istanbul time. Renders a placeholder on the server to avoid hydration mismatch. */
export default function Clock({ className = "" }: { className?: string }) {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <time className={`tabular-nums ${className}`} suppressHydrationWarning>
      {time}
    </time>
  );
}
