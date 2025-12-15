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
      className="bg-white/30 dark:bg-white/10 backdrop-blur-md rounded-2xl shadow text-neutral-900 dark:text-neutral-50"
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

// =====================================
// API YOK — Yerel JSON takvime göre hesaplar
// Tablo: (gün -> "HH:MM" -> aynı slottaki boss listesi)
// Kaynak: paylaştığın 24H EU takvim görseli
export type WeeklySchedule = Record<string, Record<string, string[]>>;

const EU_SCHEDULE: WeeklySchedule = {
  monday: {
    "00:15": ["Garmoth"],
    "01:15": ["Karanda", "Kutum", "Uturi"],
    "03:00": ["Karanda", "Bulgasal"],
    "06:00": ["Kzarka"],
    "10:00": ["Kzarka"],
    "13:00": ["Offin"],
    "15:00": ["Garmoth"],
    "17:00": ["Kutum", "Uturi"],
    "20:00": ["Nouver", "Golden Pig King", "Bulgasal"],
    "23:15": ["Kzarka", "Sangoon", "Uturi"],
  },
  tuesday: {
    "00:15": ["Garmoth"],
    "01:15": ["Karanda", "Golden Pig King"],
    "03:00": ["Kutum", "Sangoon"],
    "06:00": ["Kzarka"],
    "10:00": ["Nouver"],
    "13:00": ["Kutum"],
    "15:00": ["Garmoth"],
    "17:00": ["Nouver", "Golden Pig King"],
    "20:00": ["Karanda", "Bulgasal", "Uturi"],
    "23:15": ["Quint", "Muraka", "Golden Pig King", "Sangoon"],
  },
  wednesday: {
    "00:15": ["Garmoth"],
    "01:15": ["Kzarka", "Kutum", "Bulgasal"],
    "03:00": ["Karanda", "Golden Pig King"],
    "06:00": ["Kzarka"],
    "10:00": ["Karanda"],
    "13:00": ["Nouver"],
    "15:00": ["Garmoth"],
    "17:00": ["Kutum", "Offin", "Bulgasal"],
    "20:00": ["Vell"],
    "23:15": ["Karanda", "Kzarka", "Sangoon", "Uturi"],
  },
  thursday: {
    "00:15": ["Garmoth"],
    "01:15": ["Nouver", "Bulgasal"],
    "03:00": ["Kutum", "Sangoon"],
    "06:00": ["Nouver"],
    "10:00": ["Kutum"],
    // 13:00 yok (–)
    "15:00": ["Garmoth"],
    "17:00": ["Kzarka", "Uturi"],
    "20:00": ["Kutum", "Sangoon", "Bulgasal"],
    "23:15": ["Quint", "Muraka", "Golden Pig King", "Uturi"],
  },
  friday: {
    "00:15": ["Garmoth"],
    "01:15": ["Karanda", "Kzarka", "Sangoon"],
    "03:00": ["Nouver", "Bulgasal"],
    "06:00": ["Karanda"],
    "10:00": ["Kutum"],
    "13:00": ["Karanda"],
    "15:00": ["Garmoth"],
    "17:00": ["Nouver", "Uturi"],
    "20:00": ["Kzarka", "Golden Pig King"],
    "23:15": ["Kzarka", "Kutum", "Bulgasal", "Uturi"],
  },
  saturday: {
    "00:15": ["Garmoth"],
    "01:15": ["Karanda", "Kutum", "Golden Pig King", "Sangoon"],
    "03:00": ["Offin", "Golden Pig King", "Bulgasal"],
    "06:00": ["Nouver"],
    "10:00": ["Kutum"],
    "13:00": ["Nouver"],
    "15:00": ["Garmoth"],
    "17:00": ["Black Shadow", "Uturi", "Golden Pig King"],
    "20:00": ["Karanda", "Kzarka", "Bulgasal", "Sangoon"],
  },
  sunday: {
    // 00:15 yok
    "01:15": ["Nouver", "Kutum", "Golden Pig King", "Uturi"],
    "03:00": ["Kzarka", "Sangoon", "Bulgasal"],
    "06:00": ["Kutum"],
    "10:00": ["Nouver"],
    "13:00": ["Kzarka"],
    "15:00": ["Garmoth"],
    "17:00": ["Vell"],
    // 20:00 yok
    "20:15": ["Garmoth"],
    "23:15": ["Kzarka", "Nouver", "Golden Pig King", "Sangoon"],
  },
};

const REGION_TZ: Record<string, string> = {
  eu: "Europe/Berlin",
};

const WEEKDAY_IDX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};
const WEEK_SEC = 7 * 24 * 3600;

function fmtHMS(total: number | null | undefined) {
  if (total == null) return "--:--:--";
  const t = Math.max(0, Math.floor(total));
  const h = String(Math.floor(t / 3600)).padStart(2, "0");
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const s = String(Math.floor(t % 60)).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function labelFor(w: number, hh: number, mm: number) {
  const name =
    Object.keys(WEEKDAY_IDX).find((k) => WEEKDAY_IDX[k] === w) || "sunday";
  const pretty = name.charAt(0).toUpperCase() + name.slice(1);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(
    2,
    "0"
  )} ${pretty}`;
}

function getNowParts(tz: string) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(now);
  const hh = Number(parts.find((p) => p.type === "hour")?.value);
  const mm = Number(parts.find((p) => p.type === "minute")?.value);
  const ss = Number(parts.find((p) => p.type === "second")?.value);
  const wdStr = (
    parts.find((p) => p.type === "weekday")?.value || "Sunday"
  ).toLowerCase();
  const w = WEEKDAY_IDX[wdStr];
  return { hh, mm, ss, w };
}

function secsUntil(
  tz: string,
  targetW: number,
  hh: number,
  mm: number,
  offsetMin = 60
) {
  const { hh: H, mm: M, ss: S, w: W } = getNowParts(tz);
  const TOTAL = 7 * 1440;

  // Şu anı +ofset dakika ileri kaydır
  let nowMin = (W * 1440 + H * 60 + M + offsetMin) % TOTAL;
  if (nowMin < 0) nowMin += TOTAL;

  const tgtMin = targetW * 1440 + hh * 60 + mm;
  let deltaMin = tgtMin - nowMin;
  if (deltaMin < 0) deltaMin += TOTAL;

  return Math.max(0, deltaMin * 60 - S);
}

function computeSchedule(region: string) {
  const tz = REGION_TZ[region] || REGION_TZ.eu;
  const data = EU_SCHEDULE; // şimdilik sadece EU
  type Slot = { bosses: string[]; seconds: number; label: string };
  const slots: Slot[] = [];

  (Object.keys(data) as Array<keyof typeof data>).forEach((day) => {
    const w = WEEKDAY_IDX[day as string];
    const entries = data[day as string] || {};
    Object.entries(entries).forEach(([hhmm, bosses]) => {
      if (!bosses || bosses.length === 0) return;
      const [hh, mm] = hhmm.split(":").map(Number);
      const seconds = secsUntil(tz, w, hh, mm);
      slots.push({ bosses, seconds, label: labelFor(w, hh, mm) });
    });
  });

  if (!slots.length)
    return { previous: null, next: null, followedBy: null } as const;

  const minNext = Math.min(...slots.map((s) => s.seconds));
  const nextGroup = {
    bosses: Array.from(
      new Set(
        slots.filter((s) => s.seconds === minNext).flatMap((s) => s.bosses)
      )
    ),
    seconds: minNext,
    eta: Date.now() + minNext * 1000,
    label: slots.find((s) => s.seconds === minNext)?.label || null,
  };

  const later = slots.filter((s) => s.seconds > minNext);
  const fb = later.length ? Math.min(...later.map((s) => s.seconds)) : null;
  const followedBy =
    fb == null
      ? null
      : {
          bosses: Array.from(
            new Set(
              slots.filter((s) => s.seconds === fb).flatMap((s) => s.bosses)
            )
          ),
          seconds: fb,
          eta: Date.now() + fb * 1000,
          label: slots.find((s) => s.seconds === fb)?.label || null,
        };

  const sinceList = slots.map((s) => WEEK_SEC - s.seconds);
  const minSince = Math.min(...sinceList);
  const prevIdx = sinceList.indexOf(minSince);
  const prevSlot = slots[prevIdx];
  const previous = prevSlot
    ? { bosses: prevSlot.bosses, sinceSeconds: minSince }
    : null;

  return { previous, next: nextGroup, followedBy } as const;
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

// Telegram'a bildirim gönder (gece 1-10 arası göndermez)
async function sendTelegramNotification(bossNames: string[], timeLeft: number) {
  const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log("Telegram credentials not configured");
    return;
  }

  // Saat kontrolü - gece 1:00 ile 10:00 arasında bildirim gönderme
  const now = new Date();
  const hour = now.getHours();
  if (hour >= 1 && hour < 10) {
    console.log("Notification suppressed: quiet hours (01:00-10:00)");
    return;
  }

  const bossKey = bossNames.sort().join(",");
  const notifKey = `telegram-boss-${bossKey}`;
  const lastNotified = localStorage.getItem(notifKey);
  const lastCheck = Date.now();

  // Aynı boss için 30 saniye içinde tekrar gönderme
  if (lastNotified && lastCheck - parseInt(lastNotified) < 30000) {
    return;
  }

  localStorage.setItem(notifKey, lastCheck.toString());

  const message = `🎯 *BDO Boss Spawning Soon!*\n\n${bossNames.join(
    ", "
  )}\n⏰ *Kalış süresi:* ${fmtHMS(timeLeft)}`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch (error) {
    console.error("Telegram notification error:", error);
  }
}

export default function BossNextCard({ region }: { region: string }) {
  const [schedule, setSchedule] = useState(() => computeSchedule(region));
  const [notificationSent, setNotificationSent] = React.useState(false);

  // periyodik güncelle (etiket/sıralama ötelenir)
  useEffect(() => {
    setSchedule(computeSchedule(region));
    const id = setInterval(() => setSchedule(computeSchedule(region)), 60_000);
    return () => clearInterval(id);
  }, [region]);

  const nextLeft = useCountdown(schedule.next ? schedule.next.eta : null);
  const followLeft = useCountdown(
    schedule.followedBy ? schedule.followedBy.eta : null
  );

  // 10 dakika (600 saniye) kaldığında Telegram bildirimi gönder
  useEffect(() => {
    if (
      nextLeft != null &&
      nextLeft <= 600 &&
      nextLeft > 595 &&
      schedule.next?.bosses &&
      !notificationSent
    ) {
      sendTelegramNotification(schedule.next.bosses, nextLeft);
      setNotificationSent(true);
    } else if (nextLeft == null || nextLeft > 600) {
      setNotificationSent(false);
    }
  }, [nextLeft, schedule.next, notificationSent]);

  return (
    <InfoCard title="Black Desert Online Boss Timer" defaultOpen>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Previous */}
        <div className="md:col-span-3 rounded-2xl bg-black/5 dark:bg-white/5 p-3">
          <div className="text-sm font-semibold mb-2 opacity-80">
            Previous boss
          </div>
          <div className="space-y-2">
            {(schedule.previous?.bosses?.length
              ? schedule.previous.bosses
              : ["—"]
            ).map((b, i) => (
              <div
                key={b + i}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-sm">{b}</span>
                <span className="text-xs opacity-70">
                  {schedule.previous?.sinceSeconds != null
                    ? fmtHMS(schedule.previous.sinceSeconds)
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Next */}
        <div className="md:col-span-6 rounded-2xl bg-black/5 dark:bg-white/5 p-3">
          <div className="text-sm font-semibold mb-2 opacity-80">Next boss</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {(schedule.next?.bosses?.length ? schedule.next.bosses : ["—"]).map(
              (b, i) => (
                <div
                  key={b + i}
                  className="flex flex-col items-center justify-center rounded-xl bg-white/40 dark:bg-white/10 px-2 py-2 text-center"
                >
                  <div className="text-sm font-medium">{b}</div>
                  {schedule.next?.label && (
                    <div className="text-[10px] opacity-70">
                      {schedule.next.label}
                    </div>
                  )}
                  <div className="text-xs font-semibold mt-1">
                    {nextLeft != null
                      ? fmtHMS(nextLeft)
                      : schedule.next?.seconds != null
                      ? fmtHMS(schedule.next.seconds)
                      : "—"}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Followed by */}
        <div className="md:col-span-3 rounded-2xl bg-black/5 dark:bg-white/5 p-3">
          <div className="text-sm font-semibold mb-2 opacity-80">
            Followed by
          </div>
          <div className="space-y-2">
            {(schedule.followedBy?.bosses?.length
              ? schedule.followedBy.bosses
              : ["—"]
            ).map((b, i) => (
              <div
                key={b + i}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-sm">{b}</span>
                <span className="text-xs opacity-70">
                  {followLeft != null
                    ? fmtHMS(followLeft)
                    : schedule.followedBy?.seconds != null
                    ? fmtHMS(schedule.followedBy.seconds)
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </InfoCard>
  );
}
