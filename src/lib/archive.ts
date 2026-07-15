/** Pure helpers for the archive month calendar (no DOM/React dependency, easy to unit-reason about). */

export type CalendarCell =
  | { kind: "empty" }
  | { kind: "day"; day: number; key: string; hasEntry: boolean; isToday: boolean }
  ;

export function buildMonthCells(year: number, month0: number, todayKey: string, hasKey: (key: string) => boolean): CalendarCell[] {
  const firstDow = new Date(year, month0, 1).getDay();
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const cells: CalendarCell[] = [];
  for (let i = 0; i < firstDow; i++) cells.push({ kind: "empty" });
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month0 + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ kind: "day", day: d, key, hasEntry: hasKey(key), isToday: key === todayKey });
  }
  return cells;
}
