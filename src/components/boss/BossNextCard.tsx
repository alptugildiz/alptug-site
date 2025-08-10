/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";

// ========= Collapsible Card (senin stilin)
function InfoCard({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="bg-white/30 dark:bg-white/10 backdrop-blur-md rounded-2xl shadow dark:text-amber-50"
      open={defaultOpen}
    >
      <summary className="list-none select-none cursor-pointer px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-wide uppercase opacity-80">
          {title}
        </span>
        <span className="text-xs opacity-60">(aç/kapat)</span>
      </summary>
      <div className="p-4">{children}</div>
    </details>
  );
}

// ======= API tipleri
interface BossGroup {
  bosses: string[];
  seconds: number | null;
  eta: number | null;
  label?: string | null;
}
interface BossSchedule {
  previous?: { bosses: string[]; sinceSeconds: number | null } | null;
  next?: BossGroup | null;
  followedBy?: BossGroup | null;
}

// Legacy payload (eski sürüm uyumluluğu)
interface BossApiResponseLegacy {
  region: string;
  bosses: string[];
  spawnText: string | null;
  spawnsIn: string | null;
  spawnsInSeconds?: number | null;
  nextAt?: number | null;
}

function fmtTR(total: number) {
  const t = Math.max(0, Math.floor(total));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} sa`);
  if (m > 0) parts.push(`${m} dk`);
  if (h === 0 && m === 0) parts.push(`${s} sn`);
  return parts.join(" ");
}

function useCountdown(targetMs: number | null) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!targetMs) {
      setLeft(null);
      return;
    }
    const tick = () =>
      setLeft(Math.max(0, Math.round((targetMs - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  return left;
}

export default function BossNextCard({ region }: { region: string }) {
  const [sched, setSched] = useState<BossSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch(`/api/boss-next?region=${region}`, {
        cache: "no-store",
      });
      const data: any = await res.json();

      // Yeni: data.schedule varsa onu kullan
      if (data?.schedule) {
        setSched(data.schedule as BossSchedule);
        return;
      }

      // Eski: groups[]
      if (Array.isArray(data?.groups) && data.groups.length) {
        const g = data.groups[0];
        const next: BossGroup = {
          bosses: g.bosses || [],
          seconds: g.seconds ?? null,
          eta:
            g.eta ?? (g.seconds != null ? Date.now() + g.seconds * 1000 : null),
          label: g.label,
        };
        setSched({ previous: null, next, followedBy: null });
        return;
      }

      // En-Eski: legacy tek kayıt
      const legacy = data as BossApiResponseLegacy;
      if (legacy) {
        let secs = legacy.spawnsInSeconds ?? null;
        if (secs == null && typeof legacy.spawnsIn === "string") {
          const p = legacy.spawnsIn.split(":").map(Number);
          if (p.length === 3) secs = p[0] * 3600 + p[1] * 60 + p[2];
          else if (p.length === 2) secs = p[0] * 60 + p[1];
        }
        const next: BossGroup = {
          bosses: legacy.bosses || [],
          seconds: secs,
          eta:
            legacy.nextAt ?? (secs != null ? Date.now() + secs * 1000 : null),
          label: legacy.spawnText ?? null,
        };
        setSched({ previous: null, next, followedBy: null });
        return;
      }

      setSched(null);
    } catch (e: any) {
      setErr(e?.message || "Boss bilgisi alınamadı");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [region]);

  // Sayaçlar (ETA üzerinden, stabil)
  const nextLeft = useCountdown(sched?.next?.eta ?? null);

  // Görsel düzen: Previous | Next | Followed by
  return (
    <InfoCard title="Black Desert Online Boss Timer" defaultOpen>
      {/* Üst başlık ve sağda aksiyonlar */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs opacity-70 dark:text-amber-50">
          Server: <span className="font-medium">{region.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-xs px-2 py-1 rounded border hover:bg-white/40 dark:hover:bg-white/10 dark:text-amber-50"
            onClick={load}
            disabled={loading}
          >
            {loading ? "Yükleniyor…" : "Yenile"}
          </button>
          <a
            href={`https://mmotimer.com/bdo/?server=${region}`.replace(
              "?server=console_",
              "?server=ps4-"
            )}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-neutral-600 dark:text-neutral-300 hover:underline"
          >
            Kaynak
          </a>
        </div>
      </div>

      {err && (
        <div className="text-sm text-red-600 dark:text-red-400">{err}</div>
      )}

      {/* 12 kolon: 3 | 6 | 3 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Previous */}
        <div className="md:col-span-3 rounded-2xl bg-black/5 dark:bg-white/5 p-3">
          <div className="text-sm dark:text-amber-50 font-semibold mb-2 opacity-80">
            Previous boss
          </div>
          <div className="space-y-2">
            {(sched?.previous?.bosses?.length
              ? sched.previous.bosses
              : ["—"]
            ).map((b, i) => (
              <div
                key={b + i}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-sm dark:text-amber-50">{b}</span>
                <span className="text-xs opacity-70 dark:text-amber-50">
                  {sched?.previous?.sinceSeconds != null
                    ? fmtTR(sched.previous.sinceSeconds)
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Next (gruplu) */}
        <div className="md:col-span-9 rounded-2xl dark:text-amber-50 bg-black/5 dark:bg-white/5 p-3">
          <div className="text-sm font-semibold mb-2 opacity-80">Next boss</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {(sched?.next?.bosses?.length ? sched.next.bosses : ["—"]).map(
              (b, i) => (
                <div
                  key={b + i}
                  className="flex flex-col items-center justify-center rounded-xl bg-white/40 dark:bg-white/10 px-2 py-2 text-center"
                >
                  <div className="text-sm font-medium">{b}</div>
                  {sched?.next?.label && (
                    <div className="text-[10px] opacity-70">
                      {sched.next.label}
                    </div>
                  )}
                  <div className="text-xs font-semibold mt-1">
                    {nextLeft != null
                      ? fmtTR(nextLeft)
                      : sched?.next?.seconds != null
                      ? fmtTR(sched.next.seconds)
                      : "—"}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </InfoCard>
  );
}
