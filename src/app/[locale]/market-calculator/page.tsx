/* eslint-disable @typescript-eslint/no-unused-vars */
import BackgroundLayer from "@/components/BackgroundLayer";
import BdoMarketProfitCalculator from "@/components/calculator/BdoMarketProfitCalculator";
import BossNextCard from "@/components/boss/BossNextCard";
// 👈 yeni
import { SectionEnum } from "@/enums/SectionEnum";
import CronCostCard from "@/components/cron/CronCostCard";

export const metadata = {
  title: "BDO Tools",
  robots: { index: false, follow: false },
};

type SP = Record<string, string | string[] | undefined>;

export default async function Page({
  params: _params,
  searchParams,
}: {
  params?: Promise<{ locale: string }>;
  searchParams?: Promise<SP>;
}) {
  const sp = (await searchParams) ?? {};
  const pick = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const idStr = pick(sp.id);
  const sidStr = pick(sp.sid) ?? "0";
  const region = pick(sp.region) ?? "eu"; // 👈 BossNextCard'a da vereceğiz
  const q = pick(sp.q) ?? "";

  const id = idStr ? Number(idStr) : undefined;
  const sid = Number(sidStr);

  const activeSection = SectionEnum.Hero;

  return (
    <>
      <BackgroundLayer activeSection={activeSection} />
      <div
        style={{ position: "relative", zIndex: 40 }}
        className="mt-18 m-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="px-4">
          <div className="pt-2">
            <BossNextCard region={region} />
          </div>
          <div className="mt-6 ">
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
          <div className="my-6">
            <CronCostCard />
          </div>
        </div>
      </div>
    </>
  );
}
