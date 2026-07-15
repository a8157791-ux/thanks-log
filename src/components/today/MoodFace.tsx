import {
  Heart,
  Smiley,
  SmileyMeh,
  SmileyNervous,
  SmileyWink,
} from "@phosphor-icons/react/dist/ssr";

const MOOD_ICONS = [Smiley, SmileyWink, SmileyMeh, Heart, SmileyNervous];

export function MoodFace({ mood, size = 26 }: { mood: number; size?: number }) {
  const IconCmp = MOOD_ICONS[mood % MOOD_ICONS.length];
  return <IconCmp size={size} color="var(--color-ink)" />;
}

/** Display order used by the mood picker row (matches the design's visual ordering). */
export const MOOD_PICKER_ORDER = [0, 3, 1, 4, 2] as const;
