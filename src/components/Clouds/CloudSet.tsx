"use client";

import PixelCloud from "./PixelCloud";

export default function CloudSet() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[0, 12, 25, 30].map((delay, i) => (
        <PixelCloud
          key={i}
          delay={delay}
          top={`${20 + i * 10}%`}
          size={220}
          zIndexOfCloud={Math.floor(Math.random() * 4)}
        />
      ))}
    </div>
  );
}
