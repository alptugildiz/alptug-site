import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";
import Header from "@/components/Header";
import PixelCursor from "@/components/PixelCursor";
import { Press_Start_2P } from "next/font/google";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-arcade",
  display: "swap",
});

export const metadata = {
  title: "Alptug ILDIZ",
  description: "Software Engineer",
  icons: {
    icon: "/icons/ailogo.png",
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
    <html lang={locale} className={pressStart.variable} suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <NextIntlClientProvider locale={locale}>
          <PixelCursor />
          <Header />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
