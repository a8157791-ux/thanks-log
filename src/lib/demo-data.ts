import { addDays, dateKey } from "@/lib/gratitude";

export type DemoEntry = {
  key: string;
  items: string[];
  mood: number;
};

/**
 * Sample diaries for the logged-out /demo preview. Dates are derived from today
 * so the preview never looks stale, and nothing here touches the database.
 */
export function demoEntries(today: Date = new Date()): DemoEntry[] {
  return [
    {
      key: dateKey(today),
      items: [
        "아침 햇살에 눈뜬 조용한 순간",
        "친구가 보내준 다정한 메시지",
        "퇴근길 노을이 유난히 예뻤음",
      ],
      mood: 0,
    },
    {
      key: dateKey(addDays(today, -1)),
      items: [
        "같이 걸어준 저녁 산책",
        "따뜻했던 커피 한 잔",
        "늦게까지 들어준 통화",
      ],
      mood: 3,
    },
    {
      key: dateKey(addDays(today, -2)),
      items: [
        "비 그친 뒤의 흙 냄새",
        "오랜만에 만난 동생의 웃음",
        "무사히 끝난 발표",
      ],
      mood: 1,
    },
    {
      key: dateKey(addDays(today, -4)),
      items: ["창가에 앉은 고양이", "엄마가 보내준 반찬"],
      mood: 0,
    },
  ];
}
