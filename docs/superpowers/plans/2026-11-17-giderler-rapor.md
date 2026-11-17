# Giderler Raporu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/giderler/rapor`: tarih aralığı özeti, ay ay karşılaştırma ve tarayıcı yazdırma ile PDF.

**Architecture:** Hesaplama `src/lib/giderler/report.ts`'de saf fonksiyonlar (node:test). Sayfa sunucu bileşeni; filtreler URL'de. Yazdırma `@media print` ile.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4, node:test.

**Spec:** `docs/superpowers/specs/2026-11-17-giderler-rapor-design.md`

## Global Constraints

- Yeni npm bağımlılığı yok; `src/lib/giderler/*.ts` göreli `.ts` import'ları kullanır.
- Parametreler: `bas`, `bit` (YYYY-MM-DD), `kisi` = `ikimiz | alptug | gamze`. Varsayılan Son 3 ay + `ikimiz`.
- Değişim gösterimi: ▲/▼ + tam sayı yüzde, eşitse `=`, önceki 0 ve bu ay > 0 ise `yeni`.
- Renkler: Alptuğ `--color-signal`, Gamze `--color-cream-dim`.
- Metinler Türkçe. Oturum yoksa `/giderler`'e yönlendir.

## Review Focus

- **Ters aralık** (`bas` > `bit`): yer değiştirilmeli → `report.test.ts` parseRange.
- **Bozuk parametre** (`bas=abc`, `kisi=admin`): varsayılana düşmeli, hata fırlatmamalı → parseRange.
- **Yıl sınırını aşan aralık** (Kas 2026 → Şub 2027): ay sütunları doğru sırada → monthsInRange.
- **Kısmi uç aylar**: aralık dışındaki günler sayılmamalı → compareMonths.
- **Kayıt olmayan aralık**: boş tablo yerine "Bu aralıkta kayıt yok." → sayfa.

---

### Task 1: Rapor mantığı

**Files:** Create `src/lib/giderler/report.ts`, Test `src/lib/giderler/report.test.ts`

**Interfaces:**
- Consumes: `Expense` (store.ts), `CATEGORIES`, `UserId`, `isUser` (categories.ts), `today`, `currentMonth` (summary.ts), `shiftMonth` (calendar.ts).
- Produces:
  - `type Person = UserId | "ikimiz"`
  - `type Range = { start: string; end: string }`
  - `presets(now?: Date): { id: "bu-ay" | "son-3" | "son-6" | "bu-yil"; label: string; range: Range }[]`
  - `parseRange(bas: unknown, bit: unknown, now?: Date): Range` — geçersiz → Son 3 ay; ters → swap.
  - `parsePerson(x: unknown): Person`
  - `filterExpenses(expenses: Expense[], range: Range, person: Person): Expense[]`
  - `rangeSummary(expenses: Expense[], range: Range, person: Person)` → `{ total: number; byPerson: Record<UserId, number>; byCategory: { id; label; total }[] }`
  - `monthsInRange(range: Range): string[]` (YYYY-MM, eskiden yeniye)
  - `type Change = { kind: "none" } | { kind: "same" } | { kind: "new" } | { kind: "up" | "down"; pct: number }`
  - `change(prev: number | undefined, cur: number): Change`
  - `compareMonths(expenses, range, person, now?)` → `{ months: { month: string; partial: boolean; ongoing: boolean; total: number; byPerson: Record<UserId, number> }[]; rows: { id; label; cells: { amount: number; change: Change }[] }[]; totals: { amount: number; change: Change }[] }`

- [ ] Step 1: failing tests (parseRange default/swap/garbage, parsePerson, presets for 2026-11-17, monthsInRange across year, filterExpenses edges inclusive, rangeSummary byPerson, change cases, compareMonths partial/ongoing flags and edge-day exclusion)
- [ ] Step 2: `npm test` → FAIL
- [ ] Step 3: implement
- [ ] Step 4: `npm test` → PASS, `npx tsc --noEmit` clean
- [ ] Step 5: commit `feat(giderler): report calculations`

### Task 2: Rapor sayfası + PDF

**Files:** Create `src/app/giderler/rapor/page.tsx`, `src/app/giderler/rapor/ReportFilters.tsx` (client), `src/app/giderler/rapor/PrintButton.tsx` (client); Modify `src/app/giderler/page.tsx` (Rapor linki), `src/app/giderler/giderler.css` (`@media print`), `src/app/giderler/DatePicker.tsx` (opsiyonel `onChange`).

- [ ] Step 1: implement; sayfa `getUser()` yoksa `redirect("/giderler")`; `metadata` noindex; `title` filtreye göre `generateMetadata` ile "Giderler raporu …".
- [ ] Step 2: `npm run lint && npx tsc --noEmit && npm test` clean.
- [ ] Step 3: browser: filtre/kısayol/kişi değişimi, boş aralık, yazdırma önizlemesinde beyaz zemin ve gizli kontroller (print media emülasyonu yoksa `matchMedia` ile CSS kurallarını kontrol).
- [ ] Step 4: `next build` clean; commit `feat(giderler): report page with print-to-PDF`
