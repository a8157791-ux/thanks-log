/**
 * Sticker manifest for the comment composer's sticker picker.
 *
 * `comments.sticker` stores just the name below (e.g. "placeholder:hi"),
 * never image bytes. "placeholder" stickers are original SVGs shipped in
 * public/stickers/placeholder/ — swap those files for real purchased
 * artwork later without touching this manifest or the DB. "icon" stickers
 * render a Phosphor icon directly, no image asset needed.
 */

export type StickerItem =
  | { kind: "placeholder"; name: string; label: string }
  | { kind: "icon"; name: string; label: string; icon: string };

export type StickerSection = {
  label: string;
  favorite?: boolean;
  items: StickerItem[];
};

export const PLACEHOLDER_STICKERS: StickerItem[] = [
  { kind: "placeholder", name: "hi", label: "안녕" },
  { kind: "placeholder", name: "thanks", label: "고마워" },
  { kind: "placeholder", name: "clap", label: "짝짝짝" },
  { kind: "placeholder", name: "thumbsup", label: "최고" },
  { kind: "placeholder", name: "heart-eyes", label: "완전 좋아" },
  { kind: "placeholder", name: "laugh", label: "하하하" },
  { kind: "placeholder", name: "wink", label: "윙크" },
  { kind: "placeholder", name: "surprised", label: "놀람" },
  { kind: "placeholder", name: "cry", label: "엉엉" },
  { kind: "placeholder", name: "party", label: "축하해" },
  { kind: "placeholder", name: "zzz", label: "잘자" },
  { kind: "placeholder", name: "wow", label: "우와" },
];

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

export function stickerSections(favoriteNames: string[]): StickerSection[] {
  const favorites = favoriteNames
    .map((full) => {
      const [kind, name] = full.split(":");
      return [...PLACEHOLDER_STICKERS, ...ICON_STICKERS].find(
        (item) => item.kind === kind && item.name === name,
      );
    })
    .filter((item): item is StickerItem => Boolean(item));

  const sections: StickerSection[] = [];
  if (favorites.length) sections.push({ label: "자주 쓰는", favorite: true, items: favorites });
  sections.push({ label: "베어", items: PLACEHOLDER_STICKERS });
  return sections;
}

export function stickerFullName(item: StickerItem): string {
  return `${item.kind}:${item.name}`;
}

export function parseStickerName(full: string): { kind: string; name: string } {
  const [kind, name] = full.split(":");
  return { kind, name };
}
