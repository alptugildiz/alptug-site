/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

const SERVER_MAP: Record<string, string> = {
  eu: "eu", na: "na", jp: "jp", kr: "kr", mena: "mena", ru: "ru", sa: "sa",
  sea: "sea", th: "th", tw: "tw",
  console_eu: "ps4-xbox-eu", console_na: "ps4-xbox-na", console_asia: "ps4-asia",
};

const REGION_TZ: Record<string, string> = {
  eu: "Europe/Berlin",
  na: "America/New_York",
  sa: "America/Sao_Paulo",
  sea: "Asia/Singapore",
  kr: "Asia/Seoul",
  jp: "Asia/Tokyo",
  th: "Asia/Bangkok",
  tw: "Asia/Taipei",
  mena: "Europe/Istanbul",
  console_eu: "Europe/Berlin",
  console_na: "America/New_York",
  console_asia: "Asia/Singapore",
  ru: "Europe/Moscow",
};

const BOSSES = [
  "Kzarka","Nouver","Karanda","Kutum","Garmoth","Vell","Offin",
  "Quint","Muraka","Golden Pig King","Bulgasal","Uturi","Sangoon",
];

const WEEKDAY_IDX: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};

function strip(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function uniq<T>(a: T[]) { return Array.from(new Set(a)); }
function pickBossesFrom(text: string) {
  const out: string[] = [];
  for (const b of BOSSES) if (new RegExp(`\\b${b}\\b`, "i").test(text)) out.push(b);
  return uniq(out);
}
function pickHms(text: string): string | null {
  const m1 = text.match(/\b(\d{1,2}:\d{2}:\d{2})\b/);
  if (m1) return m1[1];
  const m2 = text.match(/\b(\d{1,2}:\d{2})\b/);
  return m2 ? m2[1] : null;
}
function toSeconds(hms: string | null): number | null {
  if (!hms) return null;
  const p = hms.split(":").map(Number);
  if (p.length === 3) return p[0]*3600 + p[1]*60 + p[2];
  if (p.length === 2) return p[0]*60 + p[1];
  return null;
}
function labelMatchToObj(m: RegExpMatchArray) {
  return { hh: Number(m[1]), mm: Number(m[2]), w: WEEKDAY_IDX[m[3].toLowerCase()] };
}
function secondsFromLabelInTZ(label: {hh:number;mm:number;w:number}, tz: string): number {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, weekday: "long",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value);
  const hhNow = get("hour"), mmNow = get("minute"), ssNow = get("second");
  const wdStr = (parts.find(p => p.type === "weekday")?.value || "Sunday").toLowerCase();
  const wdNow = WEEKDAY_IDX[wdStr];
  const nowMin = wdNow*1440 + hhNow*60 + mmNow;
  const tgtMin = label.w*1440 + label.hh*60 + label.mm;
  let delta = tgtMin - nowMin; if (delta < 0) delta += 7*1440;
  return Math.max(0, delta*60 - ssNow);
}

// Bir bölüm içinde birden çok label olabilir. Her label'ın YAKIN çevresinden boss topla.
function extractLabelGroups(seg: string, tz: string) {
  const re = /\b(0?\d|1\d|2[0-3]):([0-5]\d)\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\b/gi;
  const matches = Array.from(seg.matchAll(re));
  const groups: { bosses: string[]; seconds: number; label: string }[] = [];

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const next = matches[i+1];
    const idx = m.index ?? 0;

    // label'ın etrafından küçük bir pencere al (sayfanın tamamına bakma!)
    const start = Math.max(0, idx - 220);
    const end   = Math.min(seg.length, next ? (next.index ?? seg.length) + 40 : idx + 220);
    const chunk = seg.slice(start, end);

    const bosses = pickBossesFrom(chunk);
    if (!bosses.length) continue;

    const obj = labelMatchToObj(m);
    const seconds = secondsFromLabelInTZ(obj, tz);
    const label = `${String(obj.hh).padStart(2,"0")}:${String(obj.mm).padStart(2,"0")} ${Object.keys(WEEKDAY_IDX).find(k => WEEKDAY_IDX[k]===obj.w)!.replace(/^./,c=>c.toUpperCase())}`;
    groups.push({ bosses: uniq(bosses), seconds, label });
  }

  // Aynı saniyede birden çok küçük blok varsa birleştir
  const bySec = new Map<number, { bosses: string[]; seconds: number; label: string }>();
  for (const g of groups) {
    const cur = bySec.get(g.seconds);
    if (!cur) bySec.set(g.seconds, { ...g });
    else cur.bosses = uniq([...cur.bosses, ...g.bosses]);
  }
  return Array.from(bySec.values()).sort((a,b) => a.seconds - b.seconds);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const region = (searchParams.get("region") || "eu").toLowerCase();
  const server = SERVER_MAP[region] || "eu";
  const tz = REGION_TZ[region] || "UTC";

  try {
    const urls = [
      `https://mmotimer.com/bdo/streamwidget/stream.php?server=${server}`,
      `https://mmotimer.com/bdo/?server=${server}`,
    ];
    let merged = "";
    for (const u of urls) {
      const r = await fetch(u, { cache: "no-store", headers: { "user-agent": "Mozilla/5.0", accept: "text/html" }});
      if (r.ok) merged += " " + strip(await r.text());
    }
    if (!merged) throw new Error("source empty");

    const low = merged.toLowerCase();
    const ixPrev = low.indexOf("previous boss");
    const ixNext = low.indexOf("next boss");
    const ixFollow = low.indexOf("followed by");

    const prevSeg   = ixPrev   !== -1 ? merged.slice(ixPrev,   ixNext   !== -1 ? ixNext   : ixPrev   + 1200) : "";
    const nextSeg   = ixNext   !== -1 ? merged.slice(ixNext,   ixFollow !== -1 ? ixFollow : ixNext   + 2000) : "";
    const followSeg = ixFollow !== -1 ? merged.slice(ixFollow, ixFollow + 4000) : "";

    // Previous
    const prevBosses = pickBossesFrom(prevSeg);
    const prevHms = pickHms(prevSeg);
    const previous = (prevBosses.length || prevHms)
      ? { bosses: prevBosses, sinceSeconds: toSeconds(prevHms) }
      : null;

    // Next — tek slot (aynı saate çıkanlar birlikte)
    let nextSeconds = toSeconds(pickHms(nextSeg));
    const nextLabelRe = /\b(0?\d|1\d|2[0-3]):([0-5]\d)\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\b/i;
    const nextLabelMatch = nextSeg.match(nextLabelRe);
    if (nextSeconds == null && nextLabelMatch) nextSeconds = secondsFromLabelInTZ(labelMatchToObj(nextLabelMatch), tz);

    // Next için bossları da label yakınından al (tüm segmentten değil)
    let nextBosses: string[] = [];
    if (nextLabelMatch) {
      const idx = nextLabelMatch.index ?? 0;
      const chunk = nextSeg.slice(Math.max(0, idx - 220), Math.min(nextSeg.length, idx + 220));
      nextBosses = pickBossesFrom(chunk);
    } else {
      nextBosses = pickBossesFrom(nextSeg);
    }
    const nextLabel =
      nextLabelMatch ? `${nextLabelMatch[1].padStart(2,"0")}:${nextLabelMatch[2]} ${nextLabelMatch[3]}` : null;
    const next = {
      bosses: nextBosses,
      seconds: nextSeconds ?? null,
      eta: nextSeconds != null ? Date.now() + nextSeconds * 1000 : null,
      label: nextLabel,
    };

    // Followed by — birden çok label olabilir; her label'ın yerel grubunu çıkar
    const followGroups = extractLabelGroups(followSeg, tz);
    // next.seconds varsa ondan SONRA gelen en erken grubu seç; yoksa ilk grup
    const picked = followGroups.find(g => next.seconds == null ? true : g.seconds > next.seconds) || followGroups[0] || null;

    const followedBy = picked
      ? { bosses: picked.bosses, seconds: picked.seconds, eta: Date.now() + picked.seconds*1000, label: picked.label }
      : null;

    return NextResponse.json({ region, schedule: { previous, next, followedBy } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "boss-next failed" }, { status: 500 });
  }
}
