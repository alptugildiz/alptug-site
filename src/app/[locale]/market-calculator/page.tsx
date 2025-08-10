import BdoMarketProfitCalculator from "@/components/BdoMarketProfitCalculator";

export const metadata = {
  title: "BDO Market Hesaplayıcı",
  robots: { index: false, follow: false },
};

export default function Page({ searchParams }: { searchParams: { id?: string; sid?: string; q?: string; region?: string } }) {
  const id = searchParams.id ? Number(searchParams.id) : undefined;
  const sid = searchParams.sid ? Number(searchParams.sid) : 0;
  return (
    <BdoMarketProfitCalculator
      initialRegion={searchParams.region ?? "eu"}
      initialQuery={searchParams.q ?? ""}
      initialSelection={id !== undefined ? { id, sid } : null}
    />
  );
}