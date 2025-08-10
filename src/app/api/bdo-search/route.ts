/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

type MarketItem = { id: number; sid?: number; name?: string; basePrice?: number; icon?: string | null };

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: "no-store", headers: { accept: "application/json" } });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* keep text for debug */ }
  return { ok: res.ok, status: res.status, text, json };
}

function pickItems(payload: any): MarketItem[] {
  if (!payload) return [];
  if (Array.isArray(payload?.items)) return payload.items as MarketItem[];
  if (Array.isArray(payload)) return payload as MarketItem[];
  return [];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const region = (searchParams.get("region") || "eu").toLowerCase();

  if (q.length < 2) return NextResponse.json([]);

  // Try multiple URL patterns (Arsha deployments differ by region/version)
  const candidates = [
    `https://api.arsha.io/v2/${region}/market?lang=en`,
    `https://api.arsha.io/v2/${region}/market`,
    `https://api.arsha.io/v2/market?region=${region}&lang=en`,
    `https://api.arsha.io/v2/market?region=${region}`,
  ];

  let items: MarketItem[] = [];
  const debug: any[] = [];

  for (const url of candidates) {
    try {
      const { ok, status, json, text } = await fetchJson(url);
      debug.push({ url, ok, status, jsonKeys: json ? Object.keys(json) : [], textLen: text?.length || 0 });
      if (!ok) continue;
      const picked = pickItems(json);
      if (picked.length) { items = picked; break; }
    } catch (e: any) {
      debug.push({ url, error: e?.message });
    }
  }

  // If still empty, return debug so we can see what's happening
  if (!items.length) {
    return NextResponse.json({ items: [], debug }, { status: 200 });
  }

  const filtered = items
    .filter((it: any) => typeof it?.name === "string" && it.name.toLowerCase().includes(q))
    .slice(0, 100)
    .map((it: any) => ({
      id: Number(it.id),
      sid: Number(it.sid ?? 0),
      name: it.name,
      basePrice: Number(it.basePrice ?? 0),
      icon: it.icon ?? null,
    }));

  return NextResponse.json(filtered);
}
