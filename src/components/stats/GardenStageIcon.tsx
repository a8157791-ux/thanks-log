import { Flower, Leaf, Plant, Tree } from "@phosphor-icons/react/dist/ssr";
import type { GardenStage } from "@/lib/gratitude";

const ICON_MAP = { leaf: Leaf, plant: Plant, flower: Flower, tree: Tree };

export function GardenStageIcon({
  icon,
  size = 40,
  color = "#FFFFFF",
}: {
  icon: GardenStage["icon"];
  size?: number;
  color?: string;
}) {
  const IconCmp = ICON_MAP[icon];
  return <IconCmp size={size} weight="fill" color={color} />;
}
