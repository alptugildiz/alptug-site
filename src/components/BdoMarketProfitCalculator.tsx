/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useMemo, useState } from "react";

// ========================
// BDO Pazar Gelir Hesaplayıcı (TR)
// - App Router uyumlu client bileşeni
// - Arama & fiyat istekleri Next.js API proxy'lerinden geçer
// - Varsayılan bölge: EU, dil: EN (item adları İngilizce kalır)
// - URL ile otomatik: ?q=, ?id=, ?sid=, ?region=
// - Adet girişi: Toplam Net = Net × Adet
// ========================

type Props = {
  initialRegion?: string;
  initialQuery?: string;
  initialSelection?: { id: number; sid: number } | null;
};

function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function computeNetRevenue(
  sellPrice: number,
  opts: {
    valuePack: boolean;
    ring: boolean;
    familyFameBonus: 0 | 0.005 | 0.01 | 0.015;
  }
) {
  if (!sellPrice || sellPrice <= 0) return 0;
  let collected = sellPrice * 0.65; // %35 vergi kesintisi
  if (opts.valuePack) collected *= 1.3; // Value Pack
  if (opts.ring) collected *= 1.05; // Rich Merchant's Ring
  if (opts.familyFameBonus) collected *= 1 + opts.familyFameBonus; // Aile Ünü
  return Math.floor(collected);
}

const REGIONS = [
  { code: "eu", label: "EU" },
  { code: "na", label: "NA" },
  { code: "mena", label: "MENA" },
  { code: "sea", label: "SEA" },
  { code: "sa", label: "SA" },
  { code: "kr", label: "KR" },
  { code: "jp", label: "JP" },
  { code: "th", label: "TH" },
  { code: "tw", label: "TW" },
  { code: "console_eu", label: "Console EU" },
  { code: "console_na", label: "Console NA" },
  { code: "console_asia", label: "Console Asia" },
];

interface MarketItem {
  id: number;
  sid: number;
  name: string;
  basePrice?: number;
  icon?: string | null;
}

interface PriceResponse {
  id: number;
  sid: number;
  name: string;
  basePrice: number;
  currentMinPrice?: number;
  currentMaxPrice?: number;
  totalTrades?: number;
  icon?: string | null;
  lastUpdated?: number | null;
}

export default function BdoMarketProfitCalculator({
  initialRegion = "eu",
  initialQuery = "",
  initialSelection = null,
}: Props) {
  const [region, setRegion] = useState(initialRegion);
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query);
  const [results, setResults] = useState<MarketItem[]>([]);
  const [selected, setSelected] = useState<MarketItem | null>(null);
  const [price, setPrice] = useState<PriceResponse | null>(null);

  const [valuePack, setValuePack] = useState(true);
  const [ring, setRing] = useState(false);
  const [familyFame, setFamilyFame] = useState<0 | 0.005 | 0.01 | 0.015>(0.005);
  const [quantity, setQuantity] = useState<number>(3000); // isteğine uygun varsayılan

  // URL parametreleri ile başlangıçta seçim
  useEffect(() => {
    if (initialSelection) {
      setSelected({
        id: initialSelection.id,
        sid: initialSelection.sid,
        name: "",
        basePrice: 0,
        icon: null,
      });
    }
  }, [initialSelection]);

  // Arama (proxy)
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) {
      setResults([]);
      return;
    }
    fetch(`/api/bdo-search?q=${encodeURIComponent(q)}&region=${region}`)
      .then((r) => r.json())
      .then((items: MarketItem[] | { error: string; debug?: any }) => {
        if (Array.isArray(items)) setResults(items);
        else setResults([]);
      })
      .catch(() => setResults([]));
  }, [debouncedQuery, region]);

  // Fiyat (proxy)
  useEffect(() => {
    if (!selected) {
      setPrice(null);
      return;
    }
    fetch(
      `/api/bdo-price?id=${selected.id}&sid=${selected.sid}&region=${region}`
    )
      .then((r) => r.json())
      .then((data: PriceResponse | { error: string }) => {
        if ((data as any)?.error) setPrice(null);
        else setPrice(data as PriceResponse);
      })
      .catch(() => setPrice(null));
  }, [selected, region]);

  const sellPrice = price?.currentMinPrice || price?.basePrice || 0;
  const baseAfterTax = useMemo(() => Math.floor(sellPrice * 0.65), [sellPrice]);
  const net = useMemo(
    () =>
      computeNetRevenue(sellPrice, {
        valuePack,
        ring,
        familyFameBonus: familyFame,
      }),
    [sellPrice, valuePack, ring, familyFame]
  );
  const totalRevenue = useMemo(
    () => net * Math.max(1, quantity || 1),
    [net, quantity]
  );
  const bonusDiff = net - baseAfterTax;
  const bonusPct = baseAfterTax > 0 ? (bonusDiff / baseAfterTax) * 100 : 0;

  return (
    <div className="mt-16">
      <div className="min-h-screen w-full  text-neutral-900 dark:text-neutral-50 p-6">
        <div className="max-w-6xl mx-auto grid gap-6">
          {/* Üst başlık */}
          <header className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight">
                BDO Pazar Gelir Hesaplayıcı
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-50">
                İsme göre ara, ürünü seç ve VP/Yüzük/Aile Ünü ile net kazancını
                gör.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Bölge</label>
              <select
                className="border rounded-xl px-3 py-2  bg-white/30 dark:bg-white/10
                       backdrop-blur-md"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                {REGIONS.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </header>

          {/* Üst grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Arama + sonuçlar */}
            <div
              className="md:col-span-2 bg-white/30 dark:bg-white/10
                       backdrop-blur-md rounded-2xl shadow p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <input
                  className="w-full border rounded-xl px-3 py-2 focus:outline-none"
                  placeholder="İsimle ara (örn: Black Stone, Blackstar)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="max-h-80 overflow-auto divide-y">
                {results.map((it) => (
                  <button
                    key={`${it.id}-${it.sid}`}
                    onClick={() => setSelected(it)}
                    className={`w-full flex items-center gap-3 text-left px-2 py-2 hover:bg-neutral-50 ${
                      selected?.id === it.id && selected?.sid === it.sid
                        ? "bg-neutral-100"
                        : ""
                    }`}
                  >
                    {it.icon && (
                      <img src={it.icon} alt="" className="w-8 h-8 rounded" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-50">
                        ID: {it.id} • SID: {it.sid}{" "}
                        {it.basePrice
                          ? `• Base: ${it.basePrice.toLocaleString()}`
                          : ""}
                      </div>
                    </div>
                  </button>
                ))}
                {results.length === 0 && debouncedQuery && (
                  <div className="text-sm text-neutral-500 dark:text-neutral-50 p-3">
                    Sonuç yok — bölgiyi değiştirip tekrar dene.
                  </div>
                )}
                {!debouncedQuery && (
                  <div className="text-sm text-neutral-500 dark:text-neutral-50 p-3">
                    Aramak için yaz…
                  </div>
                )}
              </div>
            </div>

            {/* Bonuslar & Adet */}
            <div
              className=" bg-white/30 dark:bg-white/10
                       backdrop-blur-md rounded-2xl shadow p-4 grid gap-3 h-fit"
            >
              <div className="font-semibold">Vergi ve Bonuslar</div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={valuePack}
                  onChange={(e) => setValuePack(e.target.checked)}
                />
                Value Pack (+%30)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={ring}
                  onChange={(e) => setRing(e.target.checked)}
                />
                Rich Merchant`s Ring (+%5)
              </label>
              <div className="text-sm">Aile Ünü Bonusu</div>
              <select
                className="border rounded-xl px-3 py-2 bg-white/30 dark:bg-white/10
                       backdrop-blur-md text-sm"
                value={familyFame}
                onChange={(e) => setFamilyFame(Number(e.target.value) as any)}
              >
                <option value={0}>Yok</option>
                <option value={0.005}>1000-3999 (+%0.5)</option>
                <option value={0.01}>4000-6999 (+%1.0)</option>
                <option value={0.015}>7000+ (+%1.5)</option>
              </select>
              <div className="h-px bg-neutral-200" />
              <div className="font-semibold">Adet</div>
              <input
                type="number"
                min={1}
                className="border rounded px-2 py-1 w-28"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value) || 1))
                }
              />
              <div className="text-xs text-neutral-600 dark:text-neutral-50">
                Toplam Net = Net × Adet
              </div>
            </div>
          </div>

          {/* Seçili ürün & sonuç kartları */}
          <div
            className=" bg-white/30 dark:bg-white/10
                       backdrop-blur-md rounded-2xl shadow p-4 grid gap-3"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="font-semibold">Seçilen Ürün</div>
              {price?.lastUpdated && (
                <div className="text-xs text-neutral-500 dark:text-neutral-50">
                  Güncellik: {new Date(price.lastUpdated).toLocaleString()}
                </div>
              )}
            </div>

            {selected && price ? (
              <div className="grid md:grid-cols-3 gap-4 items-stretch">
                <div className="md:col-span-2 flex items-center gap-3">
                  {price.icon && (
                    <img
                      src={price.icon}
                      alt=""
                      className="w-10 h-10 rounded"
                    />
                  )}
                  <div>
                    <div className="text-lg font-semibold">
                      {price.name || `Item ${price.id}`}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-50">
                      ID: {price.id} • SID: {price.sid}
                    </div>
                  </div>
                </div>
                <div className="grid gap-1 text-right">
                  <div className="text-sm text-neutral-500 dark:text-neutral-50">
                    Kullanılan liste fiyatı
                  </div>
                  <div className="text-xl font-bold">
                    {sellPrice.toLocaleString()}{" "}
                    <span className="text-sm font-normal">silver</span>
                  </div>
                </div>

                <div className="md:col-span-3 grid sm:grid-cols-4 gap-4">
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <div className="text-xs text-neutral-500 dark:text-neutral-50 mb-1">
                      Vergi sonrası (bonus yok)
                    </div>
                    <div className="text-lg font-semibold">
                      {baseAfterTax.toLocaleString()} silver
                    </div>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <div className="text-xs text-neutral-500 dark:text-neutral-50 mb-1">
                      Seçili bonuslarla net
                    </div>
                    <div className="text-2xl font-extrabold">
                      {net.toLocaleString()} silver
                    </div>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <div className="text-xs text-neutral-500 dark:text-neutral-50 mb-1">
                      Bonus etkisi
                    </div>
                    <div className="text-lg font-semibold">
                      {bonusDiff.toLocaleString()} silver (+
                      {bonusPct.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="rounded-xl bg-emerald-200 p-3">
                    <div className="text-xs text-neutral-500 dark:text-neutral-50 mb-1">
                      Toplam (Adet × Net)
                    </div>
                    <div className="text-xl font-bold">
                      {totalRevenue.toLocaleString()} silver
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-neutral-500 dark:text-neutral-50">
                Soldan bir ürün seçin veya yukarıdan Manuel Getir`i kullanın.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
