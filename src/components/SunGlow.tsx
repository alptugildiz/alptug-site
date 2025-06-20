"use client";

export default function SunGlow() {
  return (
    <div
      className="absolute z-0 w-[700px] h-[700px] rounded-full blur-3xl opacity-100 animate-sun-orbit pointer-events-none"
      style={{
        top: "35%",
        left: "50%",
        background: `radial-gradient(circle, 
      #ff6200 0%, 
      #ff6200 30%, 
      #d79b477a 30%, 
      #d79b4740 80%, 
      #f7ead9 80%, 
      #f7ead9 100%)`,
      }}
    />
  );
}
