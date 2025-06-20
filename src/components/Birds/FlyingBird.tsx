"use client";

import Image from "next/image";

const ducks = ["/images/duck.png", "/images/duck2.png", "/images/duck3.png"];

export default function FlyingBird({
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
  const src = ducks[Math.floor(Math.random() * ducks.length)];
  const isReverse = src.includes("duck3");
  console.log("girdiii");

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
        alt="flying bird"
        width={size}
        height={size}
        className="w-full h-auto opacity-100"
        priority
      />
    </div>
  );
}
