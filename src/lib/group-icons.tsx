import {
  HeartStraight,
  House,
  PawPrint,
  Sparkle,
  Star,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

export const GROUP_ICON_CHOICES: { name: string; Icon: Icon }[] = [
  { name: "ph-heart-straight", Icon: HeartStraight },
  { name: "ph-users-three", Icon: UsersThree },
  { name: "ph-house", Icon: House },
  { name: "ph-paw-print", Icon: PawPrint },
  { name: "ph-star", Icon: Star },
  { name: "ph-sparkle", Icon: Sparkle },
];

const GROUP_ICON_MAP: Record<string, Icon> = Object.fromEntries(
  GROUP_ICON_CHOICES.map(({ name, Icon }) => [name, Icon]),
);

export function GroupIcon({ name, size = 15 }: { name: string; size?: number }) {
  const IconCmp = GROUP_ICON_MAP[name] ?? HeartStraight;
  return <IconCmp size={size} />;
}
