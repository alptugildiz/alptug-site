import type { Metadata } from "next";
import type { UserId } from "@/lib/giderler/categories.ts";
import { getUser } from "@/lib/giderler/session.ts";
import { getStore } from "@/lib/giderler/store.ts";
import { availableMonths, currentMonth, isMonth, summarize, today } from "@/lib/giderler/summary.ts";
import { logout } from "./actions";
import LoginForm from "./LoginForm";
import MonthPicker from "./MonthPicker";
import OwnerSection from "./OwnerSection";
import { button } from "./ui";
import "./giderler.css";

export const metadata: Metadata = {
  title: "Giderler",
  robots: { index: false, follow: false },
};

export default async function GiderlerPage({ searchParams }: PageProps<"/giderler">) {
  const user = await getUser();

  if (!user) {
    return (
      <main className="flex min-h-svh items-center justify-center px-4 py-16">
        <LoginForm />
      </main>
    );
  }

  const { ay } = await searchParams;
  const month = isMonth(ay) ? ay : currentMonth();
  const expenses = await getStore().list();
  const owners: UserId[] = user === "alptug" ? ["alptug", "gamze"] : ["gamze", "alptug"];

  return (
    <main className="mx-auto flex min-h-svh max-w-[1920px] flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="hud-label text-xl text-cream">Giderler</h1>
        <div className="flex flex-wrap items-center gap-3">
          <MonthPicker months={availableMonths(expenses, new Date(), month)} value={month} />
          <a href="/giderler/export" className={button} download>
            JSON indir
          </a>
          <form action={logout}>
            <button type="submit" className={button}>
              Çıkış
            </button>
          </form>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        {owners.map((owner) => (
          <OwnerSection
            key={owner}
            owner={owner}
            summary={summarize(expenses, owner, month)}
            editable={owner === user}
            defaultDate={today()}
          />
        ))}
      </div>
    </main>
  );
}
