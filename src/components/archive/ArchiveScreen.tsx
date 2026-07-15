"use client";

import { useMemo, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { buildMonthCells } from "@/lib/archive";
import { dateLabel, itemMark } from "@/lib/gratitude";
import { MoodFace } from "@/components/today/MoodFace";
import { PhotoSlider } from "@/components/ui/PhotoSlider";
import { CenterModal } from "@/components/ui/BottomSheet";

export type ArchiveEntry = { items: string[]; mood: number; photoUrls: string[] };

export function ArchiveScreen({
  entries,
  todayKey,
}: {
  entries: Record<string, ArchiveEntry>;
  todayKey: string;
}) {
  const [monthOffset, setMonthOffset] = useState(0);
  const now = new Date();
  const view = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);

  const sortedKeys = useMemo(() => Object.keys(entries).sort().reverse(), [entries]);
  const [selectedKey, setSelectedKey] = useState<string | null>(
    entries[todayKey] ? todayKey : sortedKeys[0] ?? null,
  );
  const [detailKey, setDetailKey] = useState<string | null>(null);

  const cells = buildMonthCells(
    view.getFullYear(),
    view.getMonth(),
    todayKey,
    (key) => Boolean(entries[key]),
  );

  const selected = selectedKey ? entries[selectedKey] : null;
  const detail = detailKey ? entries[detailKey] : null;

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between">
        <h2 className="m-0 font-serif text-[22px] font-normal text-ink">
          {view.getFullYear()}년 {view.getMonth() + 1}월
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMonthOffset(0);
              setSelectedKey(todayKey);
            }}
            className="h-8 rounded-btn border border-border bg-card px-3.5 text-[13px] text-muted"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={() => setMonthOffset((m) => m - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-btn border border-border bg-card text-muted"
          >
            <CaretLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => setMonthOffset((m) => m + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-btn border border-border bg-card text-muted"
          >
            <CaretRight size={14} />
          </button>
        </div>
      </div>

      <div className="mt-5.5 grid grid-cols-7 gap-1.5 text-center text-[12px] text-hint">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {cells.map((cell, i) => {
          if (cell.kind === "empty") return <div key={i} />;
          const entry = entries[cell.key];
          return (
            <button
              key={cell.key}
              type="button"
              disabled={!cell.hasEntry}
              onClick={() => setSelectedKey(cell.key)}
              style={{ aspectRatio: "0.72" }}
              className={
                cell.hasEntry
                  ? `flex flex-col gap-1 rounded-[11px] bg-card p-1.5 ${
                      selectedKey === cell.key ? "border-2 border-accent" : "border border-[#EAE4DA]"
                    }`
                  : "flex items-start rounded-[11px] border border-dashed border-[#ECE7DD] p-1.5"
              }
            >
              <div className="flex w-full items-center justify-between px-0.5">
                <span
                  className={`font-serif text-[11px] font-bold ${
                    cell.isToday ? "text-accent" : cell.hasEntry ? "text-[#B5A996]" : "text-[#CFC8BA]"
                  }`}
                >
                  {cell.day}
                </span>
                {cell.hasEntry && <MoodFace mood={entry.mood} size={16} />}
              </div>
              {cell.hasEntry && (
                <div className="grid min-h-0 flex-1 grid-cols-2 gap-0.5 overflow-hidden rounded-[7px]">
                  {entry.photoUrls.length > 0 ? (
                    entry.photoUrls
                      .slice(0, 3)
                      .map((src, idx) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={idx}
                          src={src}
                          alt=""
                          className={`h-full w-full object-cover ${idx === 0 && entry.photoUrls.length > 1 ? "row-span-2" : "col-span-2"}`}
                        />
                      ))
                  ) : (
                    <div className="col-span-2 rounded-[7px]" style={{ background: "color-mix(in srgb, var(--color-accent) 9%, transparent)" }} />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-9">
        {selected ? (
          <div className="animate-fade-up">
            <p className="m-0 mb-3.5 font-serif text-[16px] text-ink">
              {selectedKey ? dateLabel(selectedKey, true) : ""}
            </p>
            {selected.photoUrls.length > 0 && (
              <PhotoSlider
                srcs={selected.photoUrls}
                maxHeight={320}
                onClick={() => setDetailKey(selectedKey)}
              />
            )}
            <div className="mt-3.5 flex flex-col gap-2.5">
              {selected.items.map((text, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDetailKey(selectedKey)}
                  className="flex w-full items-start gap-3.5 rounded-[12px] border border-border bg-card px-4.5 py-4 text-left"
                >
                  <span className="font-serif text-[15px] text-hint">{itemMark(i)}</span>
                  <span className="flex-1 text-[15px] leading-[1.6] text-ink">{text}</span>
                  <span className="text-[18px] leading-[1.4] text-[#C9C2B3]">›</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="py-6 text-center text-[13.5px] text-hint">기록이 있는 날짜를 눌러보세요.</p>
        )}
      </div>

      <CenterModal open={!!detail} onClose={() => setDetailKey(null)}>
        {detail && detailKey && (
          <>
            <div className="flex items-baseline justify-between">
              <h3 className="m-0 font-serif text-[18px] font-normal text-ink">
                {dateLabel(detailKey, true)}
              </h3>
              <button
                type="button"
                onClick={() => setDetailKey(null)}
                className="border-0 bg-transparent text-[13px] text-faint"
              >
                닫기
              </button>
            </div>
            <ol className="mt-5.5 flex list-none flex-col gap-3.5 p-0">
              {detail.items.map((text, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-[1.65]">
                  <span className="font-serif text-hint">{itemMark(i)}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
            {detail.photoUrls.length > 0 && <PhotoSlider srcs={detail.photoUrls} maxHeight={280} />}
          </>
        )}
      </CenterModal>
    </div>
  );
}
