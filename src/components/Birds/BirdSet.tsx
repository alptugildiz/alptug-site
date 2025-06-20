"use client";

import FlyingBird from "./FlyingBird";

export default function BirdSet() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[2, 12, 25, 30, 45].map((delay, i) => {
        return (
          <FlyingBird
            key={i}
            delay={delay}
            top={`${20 + i * 10}%`}
            size={40}
            zIndexOfBird={Math.floor(Math.random() * 4)}
          />
        );
      })}
    </div>
  );
}
