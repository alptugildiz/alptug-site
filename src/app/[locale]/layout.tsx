import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "Alptug ILDIZ",
  description: "Software Engineer",
  icons: {
    icon: "/icons/favicon.ico",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} className={"font-clash"} suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <NextIntlClientProvider locale={locale}>
          <Header />
          {children}
        
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
