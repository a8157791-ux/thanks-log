import {
  BeerStein,
  Cake,
  CalendarBlank,
  Camera,
  Clover,
  Coins,
  Flower,
  Hand,
  HandsClapping,
  Heart,
  HeartStraight,
  Lightbulb,
  PencilSimple,
  PushPin,
  Smiley,
  SmileySad,
  Star,
  ThumbsUp,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import Image from "next/image";
import { parseStickerName, type StickerItem } from "@/lib/stickers";

const ICON_MAP: Record<string, Icon> = {
  Heart,
  HeartStraight,
  Smiley,
  SmileySad,
  ThumbsUp,
  HandsClapping,
  Star,
  Clover,
  Flower,
  Cake,
  BeerStein,
  Camera,
  Lightbulb,
  PencilSimple,
  Coins,
  Hand,
  CalendarBlank,
  PushPin,
};

/** Renders a sticker referenced by its full name ("placeholder:hi" / "icon:heart"). */
export function StickerByName({ full, size = 32 }: { full: string; size?: number }) {
  const { kind, name } = parseStickerName(full);
  if (kind === "placeholder") {
    return (
      <Image
        src={`/stickers/placeholder/${name}.png`}
        alt={name}
        width={size}
        height={size}
        unoptimized
      />
    );
  }
  return <IconStickerByName name={name} size={size} />;
}

export function StickerIcon({ item, size = 26 }: { item: StickerItem; size?: number }) {
  if (item.kind === "placeholder") {
    return (
      <Image
        src={`/stickers/placeholder/${item.name}.png`}
        alt={item.label}
        width={size}
        height={size}
        unoptimized
      />
    );
  }
  const IconCmp = ICON_MAP[item.icon];
  if (!IconCmp) return null;
  return <IconCmp size={size} weight="regular" color="var(--color-ink)" />;
}

const STICKER_NAME_TO_ICON: Record<string, keyof typeof ICON_MAP> = {
  heart: "Heart",
  "heart-outline": "HeartStraight",
  smile: "Smiley",
  sad: "SmileySad",
  thumbsup: "ThumbsUp",
  clap: "HandsClapping",
  star: "Star",
  clover: "Clover",
  flower: "Flower",
  cake: "Cake",
  beer: "BeerStein",
  camera: "Camera",
  bulb: "Lightbulb",
  pencil: "PencilSimple",
  coins: "Coins",
  hand: "Hand",
  calendar: "CalendarBlank",
  pin: "PushPin",
};

function IconStickerByName({ name, size }: { name: string; size: number }) {
  const IconCmp = ICON_MAP[STICKER_NAME_TO_ICON[name]];
  if (!IconCmp) return null;
  return <IconCmp size={size} weight="regular" color="var(--color-ink)" />;
}
