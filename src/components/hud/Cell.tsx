import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };

/** One compartment of a HUD strip; borders are drawn by the parent grid via divide-*. */
export default function Cell({ children, className = "" }: Props) {
  return <div className={`flex min-h-14 items-center justify-center px-4 py-3 ${className}`}>{children}</div>;
}
