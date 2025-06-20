"use client";

import Image from "next/image";

const planes = [
  "/images/plane.png",
  "/images/plane2.png",
  "/images/plane3.png",
];

export default function FlyingPlanes({
  delay = 0,
  top = "40%",
  size = 20,
  zIndexOfBird = 2,
}: {
  delay?: number;
  top?: string;
  size?: number;
  zIndexOfBird?: number;
}) {
  const src = planes[Math.floor(Math.random() * planes.length)];
  const isReverse = src.includes("plane2");
  return (
    <div
      className={`absolute pointer-events-none ${
        isReverse ? "animate-bird-reverse" : "animate-bird"
      }`}
      style={{
        top,
        left: isReverse ? `-${size}px` : `-${size}px`,
        animationDelay: `${delay}s`,
        width: `${size}px`,
        zIndex: zIndexOfBird * 10,
      }}
    >
      <Image
        src={src}
        alt="flying plane"
        width={size}
        height={size}
        className="w-full h-auto opacity-100"
        priority
      />
    </div>
  );
}
