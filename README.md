# alptugildiz.com

Personal portfolio of Alptug Ildiz. HUD / print-zine interface: charcoal and cream, halftone type, a raw WebGL dither field behind a pixel-art portrait, and a playable Game of Life.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, GSAP (ScrollTrigger + SplitText), Lenis. No UI kit, no three.js: the shader is hand-written WebGL.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint && npx tsc --noEmit && npm run build
```

## Where things live

- `src/content/resume.ts` — every piece of copy (profile, experience, skills, projects). Edit here only.
- `src/sections/*` — page sections (server components).
- `src/components/fx/Motion.tsx` — all scroll/intro choreography in one client component.
- `src/components/fx/PortraitField.tsx` — WebGL Bayer-dither field + sprite resolve shader.
- `src/components/hud/*` — panel primitives: marquee, clock, pixel icons, Istanbul dot map.

Motion respects `prefers-reduced-motion` (boot skipped, grain off, shader renders one still frame).

## Temporary lab pages

`/lab/suitcase` is a temporary, unlinked demo: the "deneme 21" Three.js suitcase + sticker prototype, prebuilt as static files. It is not part of the Next app (no React, no three.js dependency here) and carries `noindex, nofollow`.

- **Source:** `../deneme 21` (Vite). Rebuild into this repo with `npm run build:site` there.
- **Files here:** `public/lab/suitcase/**` (build output), one rewrite in `next.config.ts`, one ignore in `eslint.config.mjs`. All three are marked `TEMP lab`.

**To remove it:**

1. Delete `public/lab/suitcase/` (and `public/lab/` if empty).
2. Remove the `rewrites()` block marked `TEMP lab` from `next.config.ts`.
3. Remove the `public/lab/**` line marked `TEMP lab` from `eslint.config.mjs`.
4. Delete this section.

Check nothing is left with `git grep -n "TEMP lab"`.

## Deploy

Self-hosted on a VPS with CapRover behind Cloudflare. See [DEPLOY.md](./DEPLOY.md).
