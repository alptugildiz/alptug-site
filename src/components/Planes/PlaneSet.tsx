"use client";

import FlyingPlanes from "./FlyingPlanes";

export default function BirdSet() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[2, 12, 25, 30, 45].map((delay, i) => {
        return (
          <FlyingPlanes
            key={i}
            delay={delay}
            top={`${20 + i * 10}%`}
            size={50}
            zIndexOfBird={Math.floor(Math.random() * 4 )}
          />
        );
      })}
    </div>
  );
}
