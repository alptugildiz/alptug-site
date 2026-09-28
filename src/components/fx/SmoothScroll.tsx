"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { NAV_OFFSET, registerLenis } from "@/lib/scroll";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: NAV_OFFSET } });
    registerLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      registerLenis(null);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return children;
}
