import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/content/resume";
import { loadGoogleFont } from "@/lib/google-font";

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#1b1b1b";
const CREAM = "#fff8df";

export default async function Image() {
  const tagline = `${profile.role} · React / Next.js / TS`;
  const [display, body] = await Promise.all([
    loadGoogleFont("Unbounded:wght@900", "ALPTUGIDZ"),
    loadGoogleFont("Geist:wght@400", `SYSTEM 001 // PORTFOLIO${tagline}`),
  ]);
  const fonts = [
    ...(body ? [{ name: "Body", data: body, weight: 400 as const }] : []),
    ...(display ? [{ name: "Display", data: display, weight: 900 as const }] : []),
  ];
  const portrait = await readFile(join(process.cwd(), "public/me.png"));
  const src = `data:image/png;base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: INK, color: CREAM, padding: 40, fontFamily: "Body" }}>
        <div
          style={{
            display: "flex",
            flex: 1,
            border: `2px solid rgba(255,248,223,0.35)`,
            borderRadius: 24,
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: 48 }}>
            <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, opacity: 0.6 }}>SYSTEM 001 // PORTFOLIO</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "Display", fontSize: 118, lineHeight: 0.95, letterSpacing: -4 }}>ALPTUG</div>
              <div style={{ fontFamily: "Display", fontSize: 118, lineHeight: 0.95, letterSpacing: -4, opacity: 0.45 }}>ILDIZ</div>
            </div>
            <div style={{ display: "flex", fontSize: 28, opacity: 0.8 }}>{tagline}</div>
          </div>
          <div
            style={{
              display: "flex",
              width: 420,
              alignItems: "flex-end",
              justifyContent: "center",
              borderLeft: `2px solid rgba(255,248,223,0.35)`,
              backgroundImage: "radial-gradient(rgba(255,248,223,0.18) 2px, transparent 2px)",
              backgroundSize: "12px 12px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} width={500} height={500} alt="" style={{ imageRendering: "pixelated", marginBottom: -20 }} />
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
