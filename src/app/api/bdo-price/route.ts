/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse as NextResponse2 } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const sid = searchParams.get("sid") || "0";
  const region = (searchParams.get("region") || "eu").toLowerCase();

  if (!id) return NextResponse2.json({ error: "Missing id" }, { status: 400 });

  try {
    const url = `https://api.arsha.io/v1/${region}/price?id=${id}&sid=${sid}&lang=en`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse2.json({ error: "Failed to fetch price" }, { status: res.status });
    }
    const data = await res.json();

    return NextResponse2.json({
      id: Number(data.id),
      sid: Number(data.sid ?? sid),
      name: data.name || "",
      basePrice: Number(data.basePrice || 0),
      currentMinPrice: Number(data.currentMinPrice || 0),
      currentMaxPrice: Number(data.currentMaxPrice || 0),
      totalTrades: Number(data.totalTrades || 0),
      icon: data.icon || null,
      lastUpdated: data.lastUpdated || null,
    });
  } catch (err: any) {
    return NextResponse2.json({ error: err.message }, { status: 500 });
  }
}
