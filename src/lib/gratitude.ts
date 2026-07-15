import type { Entry } from "@/lib/types";

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;
const ITEM_MARK = ["一", "二", "三"] as const;

export function itemMark(index: number): string {
  return ITEM_MARK[index] ?? String(index + 1);
}

export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function dateLabel(key: string, withYear = false): string {
  const date = parseDateKey(key);
  const weekday = WEEKDAY_KO[date.getDay()];
  const y = withYear ? `${date.getFullYear()}년 ` : "";
  return `${y}${date.getMonth() + 1}월 ${date.getDate()}일 ${weekday}요일`;
}

export function addDays(date: Date, delta: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + delta);
  return next;
}

/** Consecutive-day streak up to today (or yesterday if today isn't logged yet), plus the longest streak on record. */
export function calcStreak(entryDates: string[]): { current: number; best: number } {
  const dateSet = new Set(entryDates);

  let cursor = new Date();
  if (!dateSet.has(dateKey(cursor))) cursor = addDays(cursor, -1);
  let current = 0;
  while (dateSet.has(dateKey(cursor))) {
    current++;
    cursor = addDays(cursor, -1);
  }

  const sortedKeys = [...dateSet].sort();
  let best = 0;
  let run = 0;
  let prevKey: string | null = null;
  for (const key of sortedKeys) {
    if (prevKey) {
      const dayGap = (parseDateKey(key).getTime() - parseDateKey(prevKey).getTime()) / 86_400_000;
      run = dayGap === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > best) best = run;
    prevKey = key;
  }

  return { current, best: Math.max(best, current) };
}

export type GardenStage = {
  name: "씨앗" | "새싹" | "꽃밭" | "우거진 밭";
  icon: "leaf" | "plant" | "flower" | "tree";
  min: number;
  next: number | null;
  tint: string;
};

export const GARDEN_STAGES: GardenStage[] = [
  { name: "씨앗", icon: "leaf", min: 0, next: 10, tint: "#f1eee6" },
  { name: "새싹", icon: "plant", min: 10, next: 30, tint: "#e9f0e3" },
  { name: "꽃밭", icon: "flower", min: 30, next: 60, tint: "#f3ecef" },
  { name: "우거진 밭", icon: "tree", min: 60, next: null, tint: "#e5efe3" },
];

export function calcGardenStage(totalItems: number): {
  stage: GardenStage;
  progressPct: number;
  nextLabel: string;
} {
  let stage = GARDEN_STAGES[0];
  for (const candidate of GARDEN_STAGES) {
    if (totalItems >= candidate.min) stage = candidate;
  }
  const progressPct = stage.next
    ? Math.min(100, Math.round(((totalItems - stage.min) / (stage.next - stage.min)) * 100))
    : 100;
  const nextLabel = stage.next
    ? `다음 단계까지 감사 ${stage.next - totalItems}개`
    : "가장 무성한 단계에 닿았어요";
  return { stage, progressPct, nextLabel };
}

const STOPWORDS = new Set([
  "오늘",
  "같이",
  "내가",
  "너의",
  "오랜만에",
  "우리",
  "정말",
  "너무",
  "하루를",
  "것",
  "함께",
  "있는",
  "있었어",
  "했다",
]);

/** Most frequent gratitude keyword across a set of entries (simple whitespace tokenizer + stopword filter). */
export function topKeyword(entriesItems: string[][]): { word: string; count: number } | null {
  const counts = new Map<string, number>();
  for (const items of entriesItems) {
    for (const line of items) {
      const tokens = line
        .replace(/[.,!?~"'’ㅎㅋ]/g, " ")
        .split(/\s+/)
        .map((w) => w.trim())
        .filter((w) => w.length >= 2 && !STOPWORDS.has(w));
      for (const token of tokens) {
        counts.set(token, (counts.get(token) ?? 0) + 1);
      }
    }
  }
  let best: { word: string; count: number } | null = null;
  for (const [word, count] of counts) {
    if (!best || count > best.count) best = { word, count };
  }
  return best;
}

export function totalItemCount(entries: Pick<Entry, "items">[]): number {
  return entries.reduce((sum, e) => sum + e.items.length, 0);
}

const MOOD_ICONS = [
  "Smiley",
  "SmileyWink",
  "SmileyMeh",
  "Heart",
  "SmileyNervous",
] as const;

export function moodIconName(mood: number): (typeof MOOD_ICONS)[number] {
  return MOOD_ICONS[mood % MOOD_ICONS.length];
}

export const MEMBER_COLORS = [
  "#b08968",
  "#9a8c98",
  "#6d9dc5",
  "#c08497",
  "#7d8b6f",
  "#c98a5e",
];

export function memberColor(index: number): string {
  return MEMBER_COLORS[index % MEMBER_COLORS.length];
}

/** Last N days (oldest first) as date keys, for the 5-week garden grid / archive month view. */
export function lastNDayKeys(n: number, from: Date = new Date()): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    keys.push(dateKey(addDays(from, -i)));
  }
  return keys;
}
