import { Fragment, type ReactNode } from "react";

type Props = {
  items: ReactNode[];
  separator?: ReactNode;
  reverse?: boolean;
  duration?: number;
  className?: string;
  itemClassName?: string;
};

/** Seamless ticker: content is rendered twice and the track slides by -50%. */
export default function Marquee({ items, separator, reverse, duration = 40, className = "", itemClassName = "" }: Props) {
  const run = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <Fragment key={i}>
          <span className={`shrink-0 px-[clamp(12px,1.6vw,28px)] ${itemClassName}`}>{item}</span>
          {separator && <span className="shrink-0">{separator}</span>}
        </Fragment>
      ))}
    </div>
  );

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className="marquee-track flex w-max animate-marquee"
        style={{
          ["--marquee-duration" as string]: `${duration}s`,
          animationDirection: reverse ? "reverse" : undefined,
        }}
      >
        {run(false)}
        {run(true)}
      </div>
    </div>
  );
}
