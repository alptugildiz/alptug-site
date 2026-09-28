import { ImageResponse } from "next/og";
import { loadGoogleFont } from "@/lib/google-font";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** The nav's "ai" mark: Unbounded Black, cream on ink. */
export default async function Icon() {
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
          borderRadius: 14,
          color: "#fff8df",
          fontFamily: "Display",
          fontSize: 38,
          letterSpacing: -2,
          paddingBottom: 4, // optical centering: Unbounded's lowercase sits high in its box
        }}
      >
        ai
      </div>
    ),
    { ...size, fonts: font ? [{ name: "Display", data: font, weight: 900 }] : undefined },
  );
}
