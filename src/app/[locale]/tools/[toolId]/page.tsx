/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams } from "next/navigation";
import BackgroundLayer from "@/components/BackgroundLayer";
import { SectionEnum } from "@/enums/SectionEnum";
import Link from "next/link";
import { useTranslations } from "next-intl";
import QRCodeReader from "@/tools/components/QRCodeReader";
import JSONFormatter from "@/tools/components/JSONFormatter";
import QRCodeGenerator from "@/tools/components/QRCodeGenerator";

export default function ToolDetailPage() {
  const params = useParams();
  const toolId = params.toolId as string;
  const t = useTranslations("tools");
  const tools = t.raw("items") as any[];
  const tool = tools.find((t) => t.id === toolId);

  if (!tool) {
    return (
      <>
        <BackgroundLayer activeSection={SectionEnum.Tools} />
        <main className="relative z-20 min-h-screen w-full pt-20 pb-10 px-4 sm:px-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/tools"
              className="inline-flex items-center px-3 py-1.5 text-sm bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white rounded-lg font-medium transition-colors ring-1 ring-white/10"
            >
              {t("backButton")}
            </Link>
            <p className="mt-4 text-zinc-400">{t("notFound")}</p>
          </div>
        </main>
      </>
    );
  }

  const getComponent = () => {
    switch (toolId) {
      case "qr-reader":
        return QRCodeReader;
      case "qr-generator":
        return QRCodeGenerator;
      case "json-formatter":
        return JSONFormatter;
      default:
        return JSONFormatter;
    }
  };

  const ToolComponent = getComponent();

  return (
    <>
      <BackgroundLayer activeSection={SectionEnum.Tools} />
      <main className="relative z-20 min-h-screen w-full pt-20 pb-10 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/tools"
            className="inline-flex items-center px-3 py-1.5 text-sm bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white rounded-lg font-medium transition-colors ring-1 ring-white/10 mb-6"
          >
            {t("backButton")}
          </Link>

          <div className="bg-white/10 dark:bg-white/5 p-8 rounded-xl ring-1 ring-white/10">
            <ToolComponent />
          </div>
        </div>
      </main>
    </>
  );
}
