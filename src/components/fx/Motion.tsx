"use client";

import { onBootDone } from "@/components/fx/BootSequence";
import { gsap, prefersReducedMotion, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

/** All page choreography in one place so sections can stay server components. */
export default function Motion() {
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const cleanups: (() => void)[] = [];

    // hero intro — waits for the boot overlay to lift
    const lines = gsap.utils.toArray<HTMLElement>("[data-hero-line]");
    const fades = gsap.utils.toArray<HTMLElement>("[data-hero-fade]");
    const splits = lines.map((el) => SplitText.create(el, { type: "chars", mask: "chars" }));
    gsap.set(splits.flatMap((s) => s.chars), { yPercent: 110 });
    gsap.set(fades, { autoAlpha: 0, y: 24 });
    cleanups.push(
      onBootDone(() => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        splits.forEach((s, i) => tl.to(s.chars, { yPercent: 0, duration: 1.1, stagger: 0.045 }, i * 0.12));
        tl.to(fades, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.35);
      }),
    );

    // generic panel reveal
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 88%",
      once: true,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { autoAlpha: 0, y: 48, clipPath: "inset(0 0 100% 0 round 14px)" },
          { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0 round 14px)", duration: 1, ease: "expo.out", stagger: 0.08, clearProps: "clipPath" },
        ),
    });
    gsap.set("[data-reveal]", { autoAlpha: 0 });

    // rows inside panels
    ScrollTrigger.batch("[data-row]", {
      start: "top 90%",
      once: true,
      onEnter: (els) => gsap.from(els, { autoAlpha: 0, x: -24, duration: 0.8, ease: "power3.out", stagger: 0.08 }),
    });

    // About: outline words fill one by one while scrolling
    const words = gsap.utils.toArray<HTMLElement>("[data-type-word]");
    if (words.length) {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: "[data-type-stack]", start: "top 75%", end: "bottom 35%", scrub: 0.6 },
      });
      words.forEach((w, i) =>
        tl.to(w, { "--outline-fill": "#fff8df", "--outline-stroke": "#fff8df", duration: 0.5 }, i * 0.35).to(
          w,
          { "--outline-fill": "#1b1b1b", "--outline-stroke": "rgb(255 248 223 / 0.56)", duration: 0.5 },
          i * 0.35 + 0.5,
        ),
      );
    }
    gsap.to("[data-scroll-meter]", {
      scaleY: 1,
      ease: "none",
      scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: true },
    });

    // Contact headline drifts sideways with scroll
    const slide = document.querySelector<HTMLElement>("[data-contact-slide]");
    if (slide) {
      const overflow = () => Math.max(0, slide.scrollWidth - slide.parentElement!.clientWidth);
      gsap.fromTo(
        slide,
        { x: () => overflow() * 0.15 },
        {
          x: () => -overflow(),
          ease: "none",
          scrollTrigger: { trigger: slide, start: "top bottom", end: "bottom 25%", scrub: true, invalidateOnRefresh: true },
        },
      );
    }

    return () => {
      cleanups.forEach((c) => c());
      splits.forEach((s) => s.revert());
    };
  });

  return null;
}
