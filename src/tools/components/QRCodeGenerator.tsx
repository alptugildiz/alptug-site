"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export default function QRCodeGenerator() {
  const t = useTranslations("tools.qrGenerator");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [input, setInput] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [qrLib, setQrLib] = useState<any>(null);

  useEffect(() => {
    loadQRLib();
  }, []);

  const loadQRLib = async () => {
    try {
      const QRCode = (await import("qrcode")).default;
      setQrLib(() => QRCode);
    } catch (err) {
      setError("QR kütüphanesi yüklenemedi");
    }
  };

  const generateQR = async () => {
    if (!input.trim()) {
      setError(t("noInput"));
      return;
    }

    if (!qrLib) {
      setError(t("generatingError"));
      return;
    }

    try {
      setError("");
      const qrDataUrl = await qrLib.toDataURL(input, {
        errorCorrectionLevel: "H",
        type: "image/png",
        quality: 0.95,
        margin: 1,
        width: 300,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCode(qrDataUrl);
    } catch (err) {
      setError(t("generatingError"));
    }
  };

  const handleDownload = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    if (!qrCode) return;

    try {
      const blob = await (await fetch(qrCode)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
    } catch (err) {
      // Fallback: copy text
      navigator.clipboard.writeText(input);
    }
  };

  const handleClear = () => {
    setInput("");
    setQrCode(null);
    setError("");
  };

  const handleGenerate = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      generateQR();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-black dark:text-white">
        QR Code Generator
      </h2>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleGenerate}
          placeholder={t("inputPlaceholder")}
          className="w-full h-24 p-3 bg-white/10 dark:bg-white/5 border border-white/20 rounded-lg text-black dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={generateQR}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white rounded-lg font-medium transition-colors text-sm ring-1 ring-white/10"
        >
          {t("generateButton")}
        </button>

        <button
          onClick={handleCopy}
          disabled={!qrCode}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white rounded-lg font-medium transition-colors text-sm ring-1 ring-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("copyButton")}
        </button>

        <button
          onClick={handleDownload}
          disabled={!qrCode}
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

      {qrCode && (
        <div className="flex justify-center p-6 bg-white/10 dark:bg-white/5 rounded-lg">
          <img
            src={qrCode}
            alt="Generated QR Code"
            className="max-w-sm border-4 border-white/20 rounded-lg"
          />
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
