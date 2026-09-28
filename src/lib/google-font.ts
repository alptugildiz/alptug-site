/**
 * Fetches a Google Font as TTF, subset to `text`, for next/og ImageResponse (which can't read woff2).
 * Returns null when offline so image generation falls back to the default font instead of failing the build.
 */
export async function loadGoogleFont(family: string, text: string) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}
