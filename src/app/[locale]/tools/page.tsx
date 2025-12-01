/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { SectionEnum } from "@/enums/SectionEnum";
import BackgroundLayer from "@/components/BackgroundLayer";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ToolsPage() {
  const t = useTranslations("tools");
  const tools = t.raw("items") as any[];

  const speak = () => {
    const msg = new SpeechSynthesisUtterance(t("description"));
    speechSynthesis.speak(msg);
  };

  return (
    <>
      <BackgroundLayer activeSection={SectionEnum.Tools} />
      <main className="relative z-20 min-h-screen w-full pt-20 pb-10 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-black dark:text-white">
              {t("title")}
            </h1>
            <p
              onClick={speak}
              className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto cursor-pointer"
            >
              {t("description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 p-6 rounded-xl shadow-md hover:shadow-lg ring-1 ring-white/10 backdrop-blur-xs transition-all duration-400 cursor-pointer hover:scale-105"
              >
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-black dark:text-white">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-400">
                    {tool.description}
                  </p>
                  <Link
                    href={`/tools/${tool.id}`}
                    className="w-full mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 rounded-lg text-black dark:text-white font-medium transition-colors duration-300 text-center block"
                  >
                    {t("openButton")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
