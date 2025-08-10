/* eslint-disable @typescript-eslint/no-unused-vars */
import BackgroundLayer from "@/components/BackgroundLayer";
import BdoMarketProfitCalculator from "@/components/BdoMarketProfitCalculator";
import { SectionEnum } from "@/enums/SectionEnum";

export const metadata = {
  title: "BDO Pazar Gelir Hesaplayıcı",
  robots: { index: false, follow: false },
};

type SP = Record<string, string | string[] | undefined>;

export default async function Page({
  // params şu an kullanılmıyor; ESLint susması için _params
  params: _params,
  searchParams,
}: {
  params?: Promise<{ locale: string }>;
  searchParams?: Promise<SP>;
}) {
  const sp = (await searchParams) ?? {};

  // helper: string | string[] | undefined → string | undefined
  const pick = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const idStr = pick(sp.id);
  const sidStr = pick(sp.sid) ?? "0";
  const region = pick(sp.region) ?? "eu";
  const q = pick(sp.q) ?? "";

  const id = idStr ? Number(idStr) : undefined;
  const sid = Number(sidStr);

  const activeSection = SectionEnum.Hero;

  return (
    <>
      <BackgroundLayer activeSection={activeSection} />
      <div style={{ position: "relative", zIndex: 1000 }}>
        <BdoMarketProfitCalculator
          initialRegion={region}
          initialQuery={q}
          initialSelection={
            id !== undefined
              ? { id, sid: Number.isFinite(sid) ? sid : 0 }
              : null
          }
        />
      </div>
    </>
  );
}
