/**
 * Sticker manifest for the comment composer's sticker picker.
 *
 * `comments.sticker` stores just the name below (e.g. "placeholder:hi"),
 * never image bytes. "placeholder" stickers are images in
 * public/stickers/placeholder/, discovered at request time by
 * `listPlaceholderStickers()` (src/lib/sticker-files.ts) — drop a new
 * PNG/SVG in that folder and it shows up with no code change. "icon"
 * stickers render a Phosphor icon directly; kept only so older comments
 * that used one still render, not offered in the picker anymore.
 */

export type StickerItem =
  | { kind: "placeholder"; name: string; label: string }
  | { kind: "icon"; name: string; label: string; icon: string };

export type StickerSection = {
  label: string;
  favorite?: boolean;
  items: StickerItem[];
};

export const ICON_STICKERS: StickerItem[] = [
  { kind: "icon", name: "heart", label: "하트", icon: "Heart" },
  { kind: "icon", name: "heart-outline", label: "하트 outline", icon: "HeartStraight" },
  { kind: "icon", name: "smile", label: "미소", icon: "Smiley" },
  { kind: "icon", name: "sad", label: "슬픔", icon: "SmileySad" },
  { kind: "icon", name: "thumbsup", label: "따봉", icon: "ThumbsUp" },
  { kind: "icon", name: "clap", label: "박수", icon: "HandsClapping" },
  { kind: "icon", name: "star", label: "별", icon: "Star" },
  { kind: "icon", name: "clover", label: "네잎클로버", icon: "Clover" },
  { kind: "icon", name: "flower", label: "꽃", icon: "Flower" },
  { kind: "icon", name: "cake", label: "케이크", icon: "Cake" },
  { kind: "icon", name: "beer", label: "맥주", icon: "BeerStein" },
  { kind: "icon", name: "camera", label: "카메라", icon: "Camera" },
  { kind: "icon", name: "bulb", label: "전구", icon: "Lightbulb" },
  { kind: "icon", name: "pencil", label: "연필", icon: "PencilSimple" },
  { kind: "icon", name: "coins", label: "동전", icon: "Coins" },
  { kind: "icon", name: "hand", label: "손", icon: "Hand" },
  { kind: "icon", name: "calendar", label: "달력", icon: "CalendarBlank" },
  { kind: "icon", name: "pin", label: "핀", icon: "PushPin" },
];

export function stickerSections(
  favoriteNames: string[],
  placeholderStickers: StickerItem[],
): StickerSection[] {
  const favorites = favoriteNames
    .map((full) => {
      const [kind, name] = full.split(":");
      return [...placeholderStickers, ...ICON_STICKERS].find(
        (item) => item.kind === kind && item.name === name,
      );
    })
    .filter((item): item is StickerItem => Boolean(item));

  const sections: StickerSection[] = [];
  if (favorites.length) sections.push({ label: "자주 쓰는", favorite: true, items: favorites });
  sections.push({ label: "베어", items: placeholderStickers });
  return sections;
}

export function stickerFullName(item: StickerItem): string {
  return `${item.kind}:${item.name}`;
}

export function parseStickerName(full: string): { kind: string; name: string } {
  const [kind, name] = full.split(":");
  return { kind, name };
}
