"use client";

import Marquee from "react-fast-marquee";
import Image from "next/image";

const techs = [
  { name: "React", src: "/icons/react.svg" },
  { name: "Vue", src: "/icons/vuejs.svg" },
  { name: "Next.js", src: "/icons/nextjs.svg" },
  { name: "TypeScript", src: "/icons/typescript.svg" },
  { name: "js", src: "/icons/js.svg" },
  { name: "Tailwind", src: "/icons/tailwindcss.svg" },
  { name: "Node.js", src: "/icons/nodejs.svg" },
  { name: "PHP", src: "/icons/php.svg" },
  { name: "Firebase", src: "/icons/firebase.svg" },
  { name: "Git", src: "/icons/git.svg" },
];

export default function TechMarquee() {
  return (
    <div className="mt-5 w-full relative top-[-40px]  hidden md:block">
      <Marquee gradient={false} speed={10} className="py-4 w-full">
        {techs.map((tech, i) => (
          <div
            key={i}
            className="
             mx-8 w-20 h-20 flex items-center justify-center
            rounded-2xl shrink-0
           bg-white/10 hover:bg-violet-200
           dark:bg-white/10 dark:hover:bg-white/20
            transition-colors duration-500
            backdrop-blur-md
            ring-2 ring-white/10 hover:ring-white/30"
          >
            <Image
              src={tech.src}
              alt={tech.name}
              width={40}
              height={40}
              title={tech.name}
              className="object-contain"
            />
          </div>
        ))}
      </Marquee>
    </div>
  );
}
