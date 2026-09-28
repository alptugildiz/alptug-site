import { ImageResponse } from "next/og";
import { loadGoogleFont } from "@/lib/google-font";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon; iOS applies its own corner mask, so the square stays square. */
export default async function AppleIcon() {
  const font = await loadGoogleFont("Unbounded:wght@900", "ai");
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#1b1b1b",
          color: "#fff8df",
          fontFamily: "Display",
          fontSize: 96,
          letterSpacing: -5,
          paddingBottom: 10,
        }}
      >
        ai
      </div>
    ),
    { ...size, fonts: font ? [{ name: "Display", data: font, weight: 900 }] : undefined },
  );
}
