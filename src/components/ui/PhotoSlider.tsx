"use client";

import { useRef } from "react";

export function PhotoSlider({
  srcs,
  maxHeight = 300,
  onClick,
  className,
}: {
  srcs: string[];
  maxHeight?: number;
  onClick?: () => void;
  className?: string;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  if (!srcs.length) return null;

  function scrollBy(dir: number) {
    const el = rowRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.92, behavior: "smooth" });
  }

  return (
    <div className={`relative ${className ?? "mt-3.5"}`}>
      <div
        ref={rowRef}
        className="no-scrollbar flex gap-2 overflow-x-auto rounded-[12px]"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {srcs.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            onClick={onClick}
            alt=""
            className="block w-full flex-none rounded-[12px] bg-panel-2 object-cover"
            style={{
              height: maxHeight,
              scrollSnapAlign: "center",
              cursor: onClick ? "pointer" : "default",
            }}
          />
        ))}
      </div>
      {srcs.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scrollBy(-1);
            }}
            className="absolute left-2.5 top-1/2 z-[3] -translate-y-1/2 border-0 bg-transparent text-[30px] leading-none text-white"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,.5)" }}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scrollBy(1);
            }}
            className="absolute right-2.5 top-1/2 z-[3] -translate-y-1/2 border-0 bg-transparent text-[30px] leading-none text-white"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,.5)" }}
          >
            ›
          </button>
          <span className="absolute right-3 top-6 z-[3] rounded-pill bg-[rgba(28,24,18,.6)] px-2.5 py-[3px] text-[11px] text-white">
            {srcs.length}장
          </span>
        </>
      )}
    </div>
  );
}
