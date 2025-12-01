/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function JSONFormatter() {
  const t = useTranslations("tools.jsonFormatter");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const validateJSON = (json: string): boolean => {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  };

  const handleFormat = () => {
    if (!input.trim()) {
      setError(t("noInput"));
      return;
    }

    if (!validateJSON(input)) {
      setIsValid(false);
      setError(t("invalidJSON"));
      setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setIsValid(true);
      setError("");
    } catch (err) {
      setIsValid(false);
      setError(t("invalidJSON"));
    }
  };

  const handleValidate = () => {
    if (!input.trim()) {
      setError(t("noInput"));
      setIsValid(null);
      return;
    }

    const valid = validateJSON(input);
    setIsValid(valid);
    setError(valid ? "" : t("invalidJSON"));
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  };

  const handleDownload = () => {
    if (output) {
      const element = document.createElement("a");
      const file = new Blob([output], { type: "application/json" });
      element.href = URL.createObjectURL(file);
      element.download = "formatted.json";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setIsValid(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-black dark:text-white">
        JSON Formatter
      </h2>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {isValid === true && (
        <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-600 dark:text-green-400 text-sm">
          ✓ {t("validJSON")}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-black dark:text-white">
            {t("inputLabel")}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("inputPlaceholder")}
            className="w-full h-64 p-3 bg-white/10 dark:bg-white/5 border border-white/20 rounded-lg text-black dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-black dark:text-white">
            {t("outputLabel")}
          </label>
          <textarea
            value={output}
            readOnly
            placeholder={t("outputPlaceholder")}
            className="w-full h-64 p-3 bg-white/10 dark:bg-white/5 border border-white/20 rounded-lg text-black dark:text-white placeholder-zinc-500 focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleFormat}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white rounded-lg font-medium transition-colors text-sm ring-1 ring-white/10"
        >
          {t("formatButton")}
        </button>

        <button
          onClick={handleValidate}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white rounded-lg font-medium transition-colors text-sm ring-1 ring-white/10"
        >
          {t("validateButton")}
        </button>

        <button
          onClick={handleCopy}
          disabled={!output}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white rounded-lg font-medium transition-colors text-sm ring-1 ring-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("copyButton")}
        </button>

        <button
          onClick={handleDownload}
          disabled={!output}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white rounded-lg font-medium transition-colors text-sm ring-1 ring-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("downloadButton")}
        </button>

        <button
          onClick={handleClear}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white rounded-lg font-medium transition-colors text-sm ring-1 ring-white/10"
        >
          {t("clearButton")}
        </button>
      </div>

      {/* Info */}
      <div className="p-4 bg-white/5 dark:bg-white/5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
        <p>• {t("infoFormat")}</p>
        <p>• {t("infoValidate")}</p>
        <p>• {t("infoCopy")}</p>
        <p>• {t("infoDownload")}</p>
        <p>• {t("infoClear")}</p>
      </div>
    </div>
  );
}
