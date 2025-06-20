"use client";

import Image from "next/image";

export default function PixelCloud({
  delay = 0,
  top = "20%",
  size = 200,
  zIndexOfCloud = 2,
}: {
  delay?: number;
  top?: string;
  size?: number;
  zIndexOfCloud?: number;
}) {
  return (
    <div
      className={`absolute animate-cloudpng pointer-events-none`}
      style={{
        top,
        left: `-${size}px`,
        animationDelay: `${delay}s`,
        width: `${size}px`,
        zIndex: zIndexOfCloud * 10,
      }}
    >
      <Image
        src="/bulut.png"
        alt="cloud"
        width={size}
        height={size}
        className="w-full h-auto opacity-100"
        priority
      />
    </div>
  );
}
