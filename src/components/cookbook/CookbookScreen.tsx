"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowSquareOut,
  CalendarBlank,
  CaretLeft,
  Check,
  CookingPot,
  NotePencil,
  Plus,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { addCookedDish, removeCookedDish, updateCookedDish } from "@/lib/actions/cooked";
import type { CookedDish } from "@/lib/types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function todayLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shiftDays(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const base = new Date(y, m - 1, d + delta);
  const yy = base.getFullYear();
  const mm = String(base.getMonth() + 1).padStart(2, "0");
  const dd = String(base.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function formatCookedDate(iso: string, today: string): string {
  if (iso === today) return "오늘";
  if (iso === shiftDays(today, -1)) return "어제";
  const [y, m, d] = iso.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()];
  const currentYear = Number(today.split("-")[0]);
  const prefix = y === currentYear ? "" : `${y}년 `;
  return `${prefix}${m}월 ${d}일 (${weekday})`;
}

// 입력한 만큼 높이가 자동으로 늘어나는 textarea.
function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
  minHeight,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const border = el.offsetHeight - el.clientHeight; // 테두리 두께 보정
    el.style.height = `${Math.max(el.scrollHeight + border, minHeight ?? 0)}px`;
  }, [value, minHeight]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className={className}
    />
  );
}

export function CookbookScreen({
  initialCooked,
  today,
}: {
  initialCooked: CookedDish[];
  today: string;
}) {
  const [cooked, setCooked] = useState<CookedDish[]>(initialCooked);
  const [nameDraft, setNameDraft] = useState("");
  const [linkDraft, setLinkDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [dateDraft, setDateDraft] = useState(today);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLink, setEditLink] = useState("");
  const [editNote, setEditNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const composingRef = useRef(false);
  const tempIdRef = useRef(0);
  const [, startTransition] = useTransition();

  const cookedByDate = useMemo(() => {
    const map = new Map<string, CookedDish[]>();
    for (const dish of cooked) {
      const list = map.get(dish.cooked_on) ?? [];
      list.push(dish);
      map.set(dish.cooked_on, list);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [cooked]);

  function submitAdd() {
    const name = nameDraft.trim();
    if (!name) return;
    const link = linkDraft.trim() || null;
    const note = noteDraft.trim() || null;
    const cookedOn = dateDraft || todayLocal();
    tempIdRef.current += 1;
    const optimistic: CookedDish = {
      id: `temp-${tempIdRef.current}`,
      user_id: "",
      name,
      link,
      note,
      cooked_on: cookedOn,
      created_at: new Date().toISOString(),
    };
    setCooked((prev) => [optimistic, ...prev]);
    setNameDraft("");
    setLinkDraft("");
    setNoteDraft("");
    startTransition(async () => {
      const { data, error } = await addCookedDish({ name, link, note, cookedOn });
      if (error) {
        setCooked((prev) => prev.filter((c) => c.id !== optimistic.id));
        setErrorMsg(error);
        return;
      }
      if (data) {
        setCooked((prev) => prev.map((c) => (c.id === optimistic.id ? data : c)));
      }
    });
  }

  function handleRemove(dish: CookedDish) {
    setCooked((prev) => prev.filter((c) => c.id !== dish.id));
    if (editingId === dish.id) setEditingId(null);
    if (dish.id.startsWith("temp-")) return;
    startTransition(async () => {
      const { error } = await removeCookedDish(dish.id);
      if (error) {
        setCooked((prev) => [dish, ...prev]);
        setErrorMsg(error);
      }
    });
  }

  function startEdit(dish: CookedDish) {
    setEditingId(dish.id);
    setEditLink(dish.link ?? "");
    setEditNote(dish.note ?? "");
  }

  function saveEdit(dish: CookedDish) {
    const link = editLink.trim() || null;
    const note = editNote.trim() || null;
    setEditingId(null);
    if (link === (dish.link ?? null) && note === (dish.note ?? null)) return;
    const previous = dish;
    setCooked((prev) => prev.map((c) => (c.id === dish.id ? { ...c, link, note } : c)));
    if (dish.id.startsWith("temp-")) {
      setErrorMsg("방금 추가한 기록이라 잠시 후 다시 수정해주세요.");
      setCooked((prev) => prev.map((c) => (c.id === dish.id ? previous : c)));
      return;
    }
    startTransition(async () => {
      const { error } = await updateCookedDish(dish.id, { link, note });
      if (error) {
        setCooked((prev) => prev.map((c) => (c.id === dish.id ? previous : c)));
        setErrorMsg(error);
      }
    });
  }

  return (
    <div className="animate-fade-up">
      <Link
        href="/fridge"
        className="inline-flex items-center gap-1 text-[13px] text-faint"
      >
        <CaretLeft size={13} weight="bold" />
        냉장고로
      </Link>

      <p className="m-0 mt-4 text-[13px] tracking-[0.04em] text-faint">그날 뭐 해먹었는지</p>
      <h1 className="mt-2.5 inline-flex items-center gap-2 font-serif text-[26px] font-normal leading-[1.45] text-ink">
        레시피 창고
        <CookingPot size={22} weight="fill" color="var(--color-accent)" />
      </h1>
      <p className="mt-1.5 text-[12.5px] text-hint">
        해먹은 메뉴랑 레시피 링크, 양념장·간단 레시피 메모를 날짜별로 모아둬요.
      </p>

      {errorMsg && (
        <div className="mt-3.5 flex items-start justify-between gap-2 rounded-card border border-[#E8B4B4] bg-[#FBEAEA] px-4 py-2.5 text-[12.5px] leading-[1.5] text-[#B23A3A]">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="shrink-0 border-0 bg-transparent p-0 text-[#B23A3A]"
            aria-label="에러 메시지 닫기"
          >
            <X size={12} weight="bold" />
          </button>
        </div>
      )}

      {/* 새 기록 작성 */}
      <div className="mt-6 flex flex-col gap-2 rounded-card border border-border bg-card px-4.5 py-4">
        <input
          type="text"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionEnd={() => {
            composingRef.current = false;
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            if (composingRef.current || e.nativeEvent.isComposing || e.keyCode === 229) return;
            e.preventDefault();
            submitAdd();
          }}
          placeholder="오늘 해먹은 메뉴"
          className="w-full border-0 bg-transparent text-[14px] font-medium text-ink outline-none placeholder:text-hint"
        />
        <input
          type="url"
          inputMode="url"
          value={linkDraft}
          onChange={(e) => setLinkDraft(e.target.value)}
          placeholder="레시피 링크 (선택)"
          className="w-full border-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-hint"
        />
        <AutoTextarea
          value={noteDraft}
          onChange={setNoteDraft}
          minHeight={46}
          placeholder="양념장·간단 레시피 메모 (선택) — 예: 간장 2, 설탕 1, 다진마늘 조금"
          className="w-full resize-none overflow-hidden border-0 bg-transparent text-[13.5px] leading-[1.7] text-ink outline-none placeholder:text-hint"
        />
        <div className="flex items-center justify-between gap-2 border-t border-divider pt-2.5">
          <label className="inline-flex items-center gap-1.5 text-[12.5px] text-faint">
            <CalendarBlank size={14} weight="regular" />
            <input
              type="date"
              value={dateDraft}
              max={todayLocal()}
              onChange={(e) => setDateDraft(e.target.value)}
              className="bg-transparent text-[12.5px] text-ink outline-none"
              aria-label="해먹은 날짜"
            />
          </label>
          <button
            type="button"
            onClick={submitAdd}
            disabled={!nameDraft.trim()}
            className="inline-flex items-center gap-1 rounded-pill bg-ink px-3.5 py-2 text-[13px] text-page disabled:opacity-40"
          >
            <Plus size={13} weight="bold" />
            기록하기
          </button>
        </div>
      </div>

      {/* 날짜별 기록 */}
      {cookedByDate.length === 0 ? (
        <p className="mt-6 rounded-card border border-dashed border-border-2 bg-card px-4.5 py-6 text-center text-[13.5px] leading-[1.6] text-faint">
          아직 기록이 없어요.
          <br />
          해먹은 메뉴를 적거나, 냉장고에서 &lsquo;해먹었어요&rsquo;를 눌러 담아보세요.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-5">
          {cookedByDate.map(([date, dishes]) => (
            <div key={date}>
              <p className="mb-2 text-[12.5px] font-semibold text-muted">{formatCookedDate(date, today)}</p>
              <div className="flex flex-col gap-2.5">
                {dishes.map((dish) => (
                  <div key={dish.id} className="rounded-card border border-border bg-card px-4.5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="m-0 text-[15px] font-semibold text-ink text-wrap-pretty">{dish.name}</p>
                      <div className="flex shrink-0 items-center gap-2">
                        {editingId !== dish.id && (
                          <button
                            type="button"
                            onClick={() => startEdit(dish)}
                            className="border-0 bg-transparent p-0 text-hint"
                            aria-label={`${dish.name} 편집`}
                          >
                            <NotePencil size={15} weight="regular" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemove(dish)}
                          className="border-0 bg-transparent p-0 text-hint"
                          aria-label={`${dish.name} 기록 삭제`}
                        >
                          <X size={14} weight="bold" />
                        </button>
                      </div>
                    </div>

                    {editingId === dish.id ? (
                      <div className="mt-2.5 flex flex-col gap-2">
                        <input
                          type="url"
                          inputMode="url"
                          value={editLink}
                          onChange={(e) => setEditLink(e.target.value)}
                          placeholder="레시피 링크"
                          className="w-full rounded-btn border border-border-2 bg-page px-3 py-2 text-[13.5px] text-ink outline-none placeholder:text-hint"
                        />
                        <AutoTextarea
                          value={editNote}
                          onChange={setEditNote}
                          minHeight={88}
                          placeholder="양념장·간단 레시피 메모"
                          className="w-full resize-none overflow-hidden rounded-btn border border-border-2 bg-page px-3 py-2 text-[14px] leading-[1.7] text-ink outline-none placeholder:text-hint"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-btn border-0 bg-transparent px-2.5 py-1.5 text-[12.5px] text-hint"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEdit(dish)}
                            className="inline-flex items-center gap-1 rounded-btn bg-ink px-3 py-1.5 text-[12.5px] text-page"
                          >
                            <Check size={13} weight="bold" />
                            저장
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {dish.note && (
                          <p className="mt-2 whitespace-pre-wrap rounded-btn bg-panel px-3 py-2.5 text-[13px] leading-[1.75] text-muted text-wrap-pretty">
                            {dish.note}
                          </p>
                        )}
                        {dish.link && (
                          <a
                            href={dish.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 break-all text-[12.5px] font-medium"
                            style={{ color: "var(--color-accent-4)" }}
                          >
                            레시피 보기
                            <ArrowSquareOut size={12} weight="bold" />
                          </a>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
