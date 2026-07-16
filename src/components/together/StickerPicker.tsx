"use client";

import { Star } from "@phosphor-icons/react/dist/ssr";
import { stickerFullName, stickerSections, type StickerItem } from "@/lib/stickers";
import { StickerIcon } from "@/components/ui/StickerImage";

export function StickerPicker({
  favorites,
  onPick,
  placeholderStickers,
}: {
  favorites: string[];
  onPick: (full: string) => void;
  placeholderStickers: StickerItem[];
}) {
  const sections = stickerSections(favorites, placeholderStickers);
  return (
    <div className="flex max-h-[260px] flex-col gap-3 overflow-y-auto rounded-[12px] bg-panel-3 p-3">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="m-0 mb-1.5 flex items-center gap-1 px-0.5 text-[11.5px] font-semibold text-hint-2">
            {section.favorite && <Star size={12} weight="fill" />}
            {section.label}
          </p>
          <div className="grid grid-cols-6 gap-1">
            {section.items.map((item) => (
              <button
                key={stickerFullName(item)}
                type="button"
                title={item.label}
                onClick={() => onPick(stickerFullName(item))}
                className="flex items-center justify-center rounded-[8px] border-0 bg-transparent p-1.5"
              >
                <StickerIcon item={item} size={26} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
