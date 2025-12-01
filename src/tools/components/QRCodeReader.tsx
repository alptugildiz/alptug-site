/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface QRResult {
  text: string;
  timestamp: string;
}

export default function QRCodeReader() {
  const t = useTranslations("tools.qrReader");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<QRResult[]>([]);
  const [error, setError] = useState<string>("");
  const [jsQR, setJsQR] = useState<any>(null);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|Android/i.test(navigator.userAgent));
    loadJsQR();
  }, []);

  const loadJsQR = async () => {
    try {
      const jsQRLib = await import("jsqr");
      setJsQR(() => jsQRLib.default);
    } catch (err) {
      setError(t("cameraError"));
    }
  };

  const startCamera = async () => {
    try {
      setError("");
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        scanQRCode();
      }
    } catch (err) {
      setError(t("cameraAccessDenied"));
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setIsScanning(false);
    }
  };

  const scanQRCode = async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning || !jsQR) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        addResult(code.data);
        stopCamera();
      }
    } catch (err) {
      // Sessizce devam et
    }

    if (isScanning) {
      requestAnimationFrame(scanQRCode);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !jsQR) return;

    try {
      setError("");
      const reader = new FileReader();

      reader.onload = async (e) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          try {
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );
            const code = jsQR(
              imageData.data,
              imageData.width,
              imageData.height
            );

            if (code) {
              addResult(code.data);
            } else {
              setError(t("noQRFound"));
            }
          } catch (err) {
            setError(t("imageProcessError"));
          }
        };
        img.src = e.target?.result as string;
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(t("fileUploadError"));
    }
  };

  const addResult = (text: string) => {
    setResults((prev) => [
      ...prev,
      {
        text,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-black dark:text-white">
        QR Code Reader
      </h2>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {isScanning ? (
          <div className="space-y-3">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg bg-black"
            />
            <button
              onClick={stopCamera}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white rounded-lg font-medium transition-colors text-sm ring-1 ring-white/10"
            >
              {t("stopScanning")}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={startCamera}
              className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white rounded-lg font-medium transition-colors text-sm ring-1 ring-white/10"
            >
              {isMobile ? t("openCamera") : t("takePicture")}
            </button>

            {!isMobile && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white rounded-lg font-medium transition-colors text-sm ring-1 ring-white/10"
                >
                  {t("selectImage")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-black dark:text-white text-sm">
            {t("results")} ({results.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-3 bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg flex justify-between items-start gap-2 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-700 dark:text-zinc-400">
                    {result.timestamp}
                  </p>
                  <p className="text-black dark:text-white break-all text-sm mt-1">
                    {result.text}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(result.text)}
                  className="px-2 py-1 text-xs bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white rounded transition-colors flex-shrink-0 ring-1 ring-white/10"
                >
                  {t("copy")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
