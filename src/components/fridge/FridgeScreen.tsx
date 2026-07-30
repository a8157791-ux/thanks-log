"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition, type PointerEvent as ReactPointerEvent } from "react";
import {
  ArrowSquareOut,
  Basket,
  BookmarkSimple,
  Check,
  Jar,
  Lightbulb,
  Package,
  Pepper,
  Plus,
  ShoppingCartSimple,
  Snowflake,
  Sparkle,
  Star,
  ThumbsDown,
  UserCirclePlus,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { GroupIcon } from "@/lib/group-icons";
import { addFridgeItem, moveFridgeItem, removeFridgeItem } from "@/lib/actions/fridge";
import { addMenuIdea, removeMenuIdea } from "@/lib/actions/ideas";
import { setDefaultFridge } from "@/lib/actions/profile";
import { passRecipe, saveRecipe, unpassAllRecipes, unsaveRecipe } from "@/lib/actions/recipes";
import { addShoppingItem, removeShoppingItem, toggleShoppingItem } from "@/lib/actions/shopping";
import { recommendRecipes, type RecipeMatch } from "@/lib/recipes";
import type { FridgeItem, FridgeZone, MenuIdea, SavedRecipe, ShoppingItem } from "@/lib/types";

type GroupOption = { id: string; name: string; icon: string };

type ZoneMeta = { key: FridgeZone; label: string; icon: typeof Snowflake; tint: string };

const ZONES: ZoneMeta[] = [
  { key: "freezer", label: "냉동실", icon: Snowflake, tint: "#8e9aaf" },
  { key: "fridge", label: "냉장고", icon: Basket, tint: "#7d8b6f" },
  { key: "kimchi", label: "김치냉장고", icon: Jar, tint: "#b0713f" },
  { key: "room", label: "실온보관", icon: Package, tint: "#b08968" },
  { key: "seasoning", label: "양념·소스", icon: Pepper, tint: "#9a8c98" },
];

const RECIPE_SITES = [
  { label: "만개의레시피", url: "https://www.10000recipe.com/index.html" },
  { label: "우리의식탁", url: "https://wtable.co.kr/recipes" },
  { label: "백종원의 요리비책", url: "https://www.youtube.com/@paik_jongwon/videos" },
  { label: "1분요리 뚝딱이형", url: "https://www.youtube.com/@1mincook" },
  { label: "유지만", url: "https://www.youtube.com/@%EC%9C%A0%EC%A7%80%EB%A7%8C/shorts" },
];

type DragState = { itemId: string; fromZone: FridgeZone; label: string; x: number; y: number };

export function FridgeScreen({
  initialItems,
  initialSaved,
  initialShopping,
  initialIdeas,
  initialPassed,
  groups,
  activeGroupId,
  defaultGroupId,
}: {
  initialItems: FridgeItem[];
  initialSaved: SavedRecipe[];
  initialShopping: ShoppingItem[];
  initialIdeas: MenuIdea[];
  initialPassed: string[];
  groups: GroupOption[];
  activeGroupId: string | null;
  defaultGroupId: string | null;
}) {
  const [items, setItems] = useState<FridgeItem[]>(initialItems);
  const [saved, setSaved] = useState<SavedRecipe[]>(initialSaved);
  const [myDefault, setMyDefault] = useState<string | null>(defaultGroupId);
  const [passedNames, setPassedNames] = useState<Set<string>>(() => new Set(initialPassed));
  const [shopping, setShopping] = useState<ShoppingItem[]>(initialShopping);
  const [shoppingDraft, setShoppingDraft] = useState("");
  const [ideas, setIdeas] = useState<MenuIdea[]>(initialIdeas);
  const [ideaDraft, setIdeaDraft] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const shoppingComposingRef = useRef(false);
  const ideaComposingRef = useRef(false);
  const [drafts, setDrafts] = useState<Record<FridgeZone, string>>({
    freezer: "",
    fridge: "",
    kimchi: "",
    room: "",
    seasoning: "",
  });
  const [, startTransition] = useTransition();
  const tempIdRef = useRef(0);

  const [drag, setDrag] = useState<DragState | null>(null);
  const [overZone, setOverZone] = useState<FridgeZone | null>(null);
  const zoneRefs = useRef<Partial<Record<FridgeZone, HTMLDivElement>>>({});
  const activePointerId = useRef<number | null>(null);

  const allNames = useMemo(() => items.map((i) => i.name), [items]);
  const savedNames = useMemo(() => new Set(saved.map((r) => r.name)), [saved]);
  const recommendations = useMemo(() => {
    const pool = recommendRecipes(allNames, 20);
    return pool.filter((r) => !passedNames.has(r.name)).slice(0, 4);
  }, [allNames, passedNames]);

  function handlePass(name: string) {
    setPassedNames((prev) => new Set(prev).add(name));
    startTransition(async () => {
      await passRecipe(name);
    });
  }

  function handleResetPassed() {
    setPassedNames(new Set());
    startTransition(async () => {
      await unpassAllRecipes();
    });
  }

  function handleSetDefault() {
    setMyDefault(activeGroupId);
    startTransition(async () => {
      await setDefaultFridge(activeGroupId);
    });
  }

  function handleToggleSave(recipe: RecipeMatch) {
    if (savedNames.has(recipe.name)) {
      setSaved((prev) => prev.filter((r) => r.name !== recipe.name));
      startTransition(async () => {
        await unsaveRecipe(recipe.name);
      });
      return;
    }
    const optimistic: SavedRecipe = {
      id: `temp-${recipe.name}`,
      user_id: "",
      name: recipe.name,
      minutes: recipe.minutes,
      matched: recipe.matched,
      missing: recipe.missing,
      link: recipe.link,
      created_at: "",
    };
    setSaved((prev) => [optimistic, ...prev]);
    startTransition(async () => {
      await saveRecipe({
        name: recipe.name,
        minutes: recipe.minutes,
        matched: recipe.matched,
        missing: recipe.missing,
        link: recipe.link,
      });
    });
  }

  function handleUnsave(name: string) {
    setSaved((prev) => prev.filter((r) => r.name !== name));
    startTransition(async () => {
      await unsaveRecipe(name);
    });
  }

  function submitAddShopping() {
    const name = shoppingDraft.trim();
    if (!name) return;
    tempIdRef.current += 1;
    const optimistic: ShoppingItem = {
      id: `temp-${tempIdRef.current}`,
      user_id: "",
      name,
      done: false,
      created_at: "",
    };
    setShopping((prev) => [...prev, optimistic]);
    setShoppingDraft("");
    startTransition(async () => {
      await addShoppingItem(name);
    });
  }

  function handleToggleShopping(item: ShoppingItem) {
    setShopping((prev) => prev.map((s) => (s.id === item.id ? { ...s, done: !s.done } : s)));
    if (item.id.startsWith("temp-")) return;
    startTransition(async () => {
      await toggleShoppingItem(item.id, !item.done);
    });
  }

  function handleRemoveShopping(item: ShoppingItem) {
    setShopping((prev) => prev.filter((s) => s.id !== item.id));
    if (item.id.startsWith("temp-")) return;
    startTransition(async () => {
      await removeShoppingItem(item.id);
    });
  }

  function submitAddIdea() {
    const note = ideaDraft.trim();
    if (!note) return;
    tempIdRef.current += 1;
    const optimistic: MenuIdea = {
      id: `temp-${tempIdRef.current}`,
      user_id: "",
      note,
      created_at: "",
    };
    setIdeas((prev) => [optimistic, ...prev]);
    setIdeaDraft("");
    startTransition(async () => {
      await addMenuIdea(note);
    });
  }

  function handleRemoveIdea(idea: MenuIdea) {
    setIdeas((prev) => prev.filter((i) => i.id !== idea.id));
    if (idea.id.startsWith("temp-")) return;
    startTransition(async () => {
      await removeMenuIdea(idea.id);
    });
  }

  function submitAdd(zone: FridgeZone) {
    const name = drafts[zone].trim();
    if (!name) return;
    tempIdRef.current += 1;
    const tempId = `temp-${tempIdRef.current}`;
    const optimistic: FridgeItem = {
      id: tempId,
      user_id: "",
      group_id: activeGroupId,
      zone,
      name,
      created_at: "",
    };
    setItems((prev) => [...prev, optimistic]);
    setDrafts((prev) => ({ ...prev, [zone]: "" }));
    startTransition(async () => {
      const { error } = await addFridgeItem(zone, name, activeGroupId);
      if (error) {
        setItems((prev) => prev.filter((i) => i.id !== tempId));
        setErrorMsg(error);
      }
    });
  }

  function submitRemove(item: FridgeItem) {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    if (item.id.startsWith("temp-")) return;
    startTransition(async () => {
      const { error } = await removeFridgeItem(item.id);
      if (error) {
        setItems((prev) => [...prev, item]);
        setErrorMsg(error);
      }
    });
  }

  function zoneAtPoint(x: number, y: number): FridgeZone | null {
    for (const zone of ZONES) {
      const el = zoneRefs.current[zone.key];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return zone.key;
      }
    }
    return null;
  }

  function handleChipPointerDown(item: FridgeItem, e: ReactPointerEvent<HTMLSpanElement>) {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointerId.current = e.pointerId;
    setDrag({ itemId: item.id, fromZone: item.zone, label: item.name, x: e.clientX, y: e.clientY });
    setOverZone(item.zone);
  }

  function handleChipPointerMove(e: ReactPointerEvent<HTMLSpanElement>) {
    if (activePointerId.current !== e.pointerId) return;
    setDrag((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : prev));
    setOverZone(zoneAtPoint(e.clientX, e.clientY));
  }

  function handleChipPointerUp(e: ReactPointerEvent<HTMLSpanElement>) {
    if (activePointerId.current !== e.pointerId || !drag) return;
    const targetZone = zoneAtPoint(e.clientX, e.clientY);
    const { itemId, fromZone } = drag;
    activePointerId.current = null;
    setDrag(null);
    setOverZone(null);
    if (targetZone && targetZone !== fromZone) {
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, zone: targetZone } : i)));
      if (!itemId.startsWith("temp-")) {
        startTransition(async () => {
          const { error } = await moveFridgeItem(itemId, targetZone);
          if (error) {
            setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, zone: fromZone } : i)));
            setErrorMsg(error);
          }
        });
      }
    }
  }

  return (
    <div className="animate-fade-up">
      <p className="m-0 text-[13px] tracking-[0.04em] text-faint">오늘의 냉장고</p>
      <h1 className="mt-2.5 font-serif text-[26px] font-normal leading-[1.45] text-ink">
        뭐 해먹지?
      </h1>
      <p className="mt-1.5 text-[12.5px] text-hint">재료를 꾹 눌러서 다른 칸으로 옮길 수 있어요.</p>

      {errorMsg && (
        <div className="mt-3.5 flex items-start justify-between gap-2 rounded-card border border-[#E8B4B4] bg-[#FBEAEA] px-4 py-2.5 text-[12.5px] leading-[1.5] text-[#B23A3A]">
          <span>저장에 실패했어요: {errorMsg}</span>
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

      <div className="no-scrollbar mt-4.5 flex items-center gap-2 overflow-x-auto pb-1">
        <Link
          href="/fridge?g=personal"
          className={
            activeGroupId === null
              ? "inline-flex flex-none items-center gap-1.5 whitespace-nowrap rounded-pill border-0 bg-ink px-3.5 py-2 text-[13px] text-page"
              : "inline-flex flex-none items-center gap-1.5 whitespace-nowrap rounded-pill border border-border-2 bg-card px-3.5 py-2 text-[13px] text-muted"
          }
        >
          내 냉장고
        </Link>
        {groups.map((group) => (
          <Link
            key={group.id}
            href={`/fridge?g=${group.id}`}
            className={
              activeGroupId === group.id
                ? "inline-flex flex-none items-center gap-1.5 whitespace-nowrap rounded-pill border-0 bg-ink px-3.5 py-2 text-[13px] text-page"
                : "inline-flex flex-none items-center gap-1.5 whitespace-nowrap rounded-pill border border-border-2 bg-card px-3.5 py-2 text-[13px] text-muted"
            }
          >
            <GroupIcon name={group.icon} size={14} />
            {group.name}
          </Link>
        ))}
        <Link
          href="/archive"
          className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap rounded-pill border border-dashed border-border-2 px-3.5 py-2 text-[13px] text-faint"
        >
          <UserCirclePlus size={14} />
          {groups.length === 0 ? "친구랑 같이 쓰기" : "그룹 추가"}
        </Link>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="m-0 text-[12px] text-hint">
          {activeGroupId ? "이 그룹 멤버들과 냉장고를 같이 보고 수정해요." : "나만 보이는 개인 냉장고예요."}
        </p>
        {myDefault === activeGroupId ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-[12px] text-hint">
            <Star size={12} weight="fill" color="var(--color-accent-4)" />
            기본으로 열림
          </span>
        ) : (
          <button
            type="button"
            onClick={handleSetDefault}
            className="inline-flex shrink-0 items-center gap-1 border-0 bg-transparent p-0 text-[12px] text-faint"
          >
            <Star size={12} weight="regular" />
            기본으로 설정
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {ZONES.map((zone) => (
          <ZonePanel
            key={zone.key}
            zone={zone}
            items={items.filter((i) => i.zone === zone.key)}
            draft={drafts[zone.key]}
            onDraftChange={(v) => setDrafts((prev) => ({ ...prev, [zone.key]: v }))}
            onAdd={() => submitAdd(zone.key)}
            onRemove={submitRemove}
            registerRef={(el) => {
              if (el) zoneRefs.current[zone.key] = el;
            }}
            isDropTarget={overZone === zone.key && drag !== null && drag.fromZone !== zone.key}
            draggingItemId={drag?.itemId ?? null}
            onChipPointerDown={handleChipPointerDown}
            onChipPointerMove={handleChipPointerMove}
            onChipPointerUp={handleChipPointerUp}
          />
        ))}
      </div>

      <div className="mt-9">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="m-0 text-[12px] uppercase tracking-[0.08em] text-hint">
              지금 재료로 만들 수 있는
            </p>
            <h3 className="mt-1.5 inline-flex items-center gap-1.5 font-serif text-[17px] font-normal text-ink">
              오늘의 메뉴 추천
              <Sparkle size={14} weight="fill" color="var(--color-accent-4)" />
            </h3>
          </div>
          {passedNames.size > 0 && (
            <button
              type="button"
              onClick={handleResetPassed}
              className="border-0 bg-transparent p-0 text-[12px] text-hint"
            >
              패스한 메뉴 다시 보기
            </button>
          )}
        </div>

        {recommendations.length === 0 ? (
          <p className="mt-3.5 rounded-card border border-dashed border-border-2 bg-card px-4.5 py-5 text-[13.5px] leading-[1.6] text-faint">
            냉장고에 재료를 2개 이상 넣어주면 만들 수 있는 메뉴를 추천해드려요.
          </p>
        ) : (
          <div className="mt-3.5 flex flex-col gap-2.5">
            {recommendations.map((r) => {
              const isSaved = savedNames.has(r.name);
              return (
                <div key={r.name} className="rounded-card border border-border bg-card px-4.5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="m-0 text-[15px] font-semibold text-ink">{r.name}</p>
                    <span className="shrink-0 text-[11px] text-hint">{r.minutes}분</span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] text-faint">
                    {r.matched.join(" · ")}
                    {r.missing.length > 0 && (
                      <span className="text-hint"> · {r.missing.join(", ")} 있으면 더 좋아요</span>
                    )}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <a
                      href={r.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[13px] font-medium"
                      style={{ color: "var(--color-accent-4)" }}
                    >
                      레시피 보기
                      <ArrowSquareOut size={13} weight="bold" />
                    </a>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handlePass(r.name)}
                        className="inline-flex items-center gap-1 rounded-btn border-0 bg-transparent px-2 py-1.5 text-[12px] text-faint"
                        aria-label={`${r.name} 패스하기`}
                      >
                        <ThumbsDown size={14} weight="regular" />
                        패스
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleSave(r)}
                        className="inline-flex items-center gap-1 rounded-btn border-0 bg-transparent px-2 py-1.5 text-[12px]"
                        style={{ color: isSaved ? "var(--color-accent-4)" : "var(--color-faint)" }}
                        aria-label={`${r.name} ${isSaved ? "저장 취소" : "저장하기"}`}
                      >
                        <BookmarkSimple size={14} weight={isSaved ? "fill" : "regular"} />
                        {isSaved ? "저장됨" : "저장"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {saved.length > 0 && (
        <div className="mt-9">
          <p className="m-0 text-[12px] uppercase tracking-[0.08em] text-hint">다음에 또 해먹으려고</p>
          <h3 className="mt-1.5 inline-flex items-center gap-1.5 font-serif text-[17px] font-normal text-ink">
            저장한 메뉴
            <BookmarkSimple size={14} weight="fill" color="var(--color-accent-4)" />
          </h3>
          <div className="mt-3.5 flex flex-col gap-2.5">
            {saved.map((r) => (
              <div key={r.id} className="rounded-card border border-border bg-card px-4.5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="m-0 text-[15px] font-semibold text-ink">{r.name}</p>
                  <button
                    type="button"
                    onClick={() => handleUnsave(r.name)}
                    className="shrink-0 border-0 bg-transparent p-0 text-hint"
                    aria-label={`${r.name} 저장 취소`}
                  >
                    <X size={13} weight="bold" />
                  </button>
                </div>
                <a
                  href={r.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-medium"
                  style={{ color: "var(--color-accent-4)" }}
                >
                  레시피 보기
                  <ArrowSquareOut size={13} weight="bold" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-9">
        <p className="m-0 text-[12px] uppercase tracking-[0.08em] text-hint">문득 떠오르면 바로</p>
        <h3 className="mt-1.5 inline-flex items-center gap-1.5 font-serif text-[17px] font-normal text-ink">
          번뜩이는 메뉴 아이디어
          <Lightbulb size={14} weight="fill" color="var(--color-accent-2)" />
        </h3>
        <div className="mt-3.5 rounded-card border border-border bg-card px-4.5 py-2">
          {ideas.map((idea, i) => (
            <div
              key={idea.id}
              className={
                i === 0
                  ? "flex items-start gap-2.5 py-2.5"
                  : "flex items-start gap-2.5 border-t border-divider py-2.5"
              }
            >
              <span className="flex-1 text-[13.5px] leading-[1.6] text-ink text-wrap-pretty">
                {idea.note}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveIdea(idea)}
                className="mt-0.5 shrink-0 border-0 bg-transparent p-0 text-hint"
                aria-label="아이디어 삭제"
              >
                <X size={12} weight="bold" />
              </button>
            </div>
          ))}
          <div className={ideas.length > 0 ? "flex items-center gap-2 border-t border-divider py-2.5" : "flex items-center gap-2 py-2.5"}>
            <input
              type="text"
              value={ideaDraft}
              onChange={(e) => setIdeaDraft(e.target.value)}
              onCompositionStart={() => {
                ideaComposingRef.current = true;
              }}
              onCompositionEnd={() => {
                ideaComposingRef.current = false;
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                if (ideaComposingRef.current || e.nativeEvent.isComposing || e.keyCode === 229) return;
                e.preventDefault();
                submitAddIdea();
              }}
              placeholder="다음엔 이런 거 해먹어볼까?"
              className="flex-1 border-0 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-hint"
            />
            <button
              type="button"
              onClick={submitAddIdea}
              className="shrink-0 border-0 bg-transparent p-0 text-faint"
              aria-label="아이디어 추가"
            >
              <Plus size={14} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-9">
        <p className="m-0 text-[12px] uppercase tracking-[0.08em] text-hint">빠진 재료 체크</p>
        <h3 className="mt-1.5 inline-flex items-center gap-1.5 font-serif text-[17px] font-normal text-ink">
          장 볼 재료
          <ShoppingCartSimple size={14} weight="fill" color="var(--color-accent)" />
        </h3>
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 rounded-card bg-panel px-4.5 py-4">
          {shopping.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-card px-3 py-1.5 text-[13px]"
              style={{
                color: item.done ? "var(--color-hint)" : "var(--color-ink)",
                textDecoration: item.done ? "line-through" : "none",
              }}
            >
              <button
                type="button"
                onClick={() => handleToggleShopping(item)}
                className="flex items-center justify-center border-0 bg-transparent p-0"
                aria-label={item.done ? `${item.name} 구매 취소` : `${item.name} 구매 완료`}
              >
                <Check size={11} weight="bold" color={item.done ? "var(--color-accent)" : "var(--color-hint-2)"} />
              </button>
              {item.name}
              <button
                type="button"
                onClick={() => handleRemoveShopping(item)}
                className="border-0 bg-transparent p-0 text-hint"
                aria-label={`${item.name} 삭제`}
              >
                <X size={11} weight="bold" />
              </button>
            </span>
          ))}
          <span className="inline-flex items-center gap-1 rounded-pill border border-dashed border-border-2 px-2.5 py-1.5">
            <input
              type="text"
              value={shoppingDraft}
              onChange={(e) => setShoppingDraft(e.target.value)}
              onCompositionStart={() => {
                shoppingComposingRef.current = true;
              }}
              onCompositionEnd={() => {
                shoppingComposingRef.current = false;
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                if (shoppingComposingRef.current || e.nativeEvent.isComposing || e.keyCode === 229) return;
                e.preventDefault();
                submitAddShopping();
              }}
              placeholder="살 재료 추가"
              className="chip-input w-[84px] border-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-hint"
            />
            <button
              type="button"
              onClick={submitAddShopping}
              className="border-0 bg-transparent p-0 text-faint"
              aria-label="장 볼 재료 추가"
            >
              <Plus size={12} weight="bold" />
            </button>
          </span>
        </div>
      </div>

      <div className="mt-9">
        <p className="m-0 text-[12px] uppercase tracking-[0.08em] text-hint">더 찾아보고 싶다면</p>
        <h3 className="mt-1.5 font-serif text-[17px] font-normal text-ink">레시피 사이트 바로가기</h3>
        <div className="mt-3.5 flex flex-wrap gap-2">
          {RECIPE_SITES.map((site) => (
            <a
              key={site.url}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-card px-3.5 py-2 text-[13px] text-ink"
            >
              {site.label}
              <ArrowSquareOut size={12} weight="bold" color="var(--color-faint)" />
            </a>
          ))}
        </div>
      </div>

      {drag && (
        <div
          className="pointer-events-none fixed z-50 rounded-pill border border-border-2 bg-card px-3.5 py-2 text-[13px] font-medium text-ink shadow-hero"
          style={{ left: drag.x, top: drag.y, transform: "translate(-50%, -130%)" }}
        >
          {drag.label}
        </div>
      )}
    </div>
  );
}

function ZonePanel({
  zone,
  items,
  draft,
  onDraftChange,
  onAdd,
  onRemove,
  registerRef,
  isDropTarget,
  draggingItemId,
  onChipPointerDown,
  onChipPointerMove,
  onChipPointerUp,
}: {
  zone: ZoneMeta;
  items: FridgeItem[];
  draft: string;
  onDraftChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (item: FridgeItem) => void;
  registerRef: (el: HTMLDivElement | null) => void;
  isDropTarget: boolean;
  draggingItemId: string | null;
  onChipPointerDown: (item: FridgeItem, e: ReactPointerEvent<HTMLSpanElement>) => void;
  onChipPointerMove: (e: ReactPointerEvent<HTMLSpanElement>) => void;
  onChipPointerUp: (e: ReactPointerEvent<HTMLSpanElement>) => void;
}) {
  const Icon = zone.icon;
  const composingRef = useRef(false);
  return (
    <div
      ref={registerRef}
      className="rounded-card px-4.5 py-4 transition-colors"
      style={{
        background: isDropTarget ? "color-mix(in srgb, var(--color-accent) 14%, var(--color-panel))" : "var(--color-panel)",
        outline: isDropTarget ? "1.5px dashed var(--color-accent)" : "1.5px dashed transparent",
        outlineOffset: "-1.5px",
      }}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <Icon size={16} weight="regular" color={zone.tint} />
        <span className="text-[13px] font-semibold text-ink">{zone.label}</span>
        <span className="text-[12px] text-hint">{items.length}</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {items.map((item) => (
          <span
            key={item.id}
            onPointerDown={(e) => onChipPointerDown(item, e)}
            onPointerMove={onChipPointerMove}
            onPointerUp={onChipPointerUp}
            onPointerCancel={onChipPointerUp}
            className="inline-flex cursor-grab items-center gap-1.5 rounded-pill border border-border bg-card px-3 py-1.5 text-[13px] text-ink active:cursor-grabbing"
            style={{
              touchAction: "none",
              opacity: draggingItemId === item.id ? 0.35 : 1,
            }}
          >
            {item.name}
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onRemove(item)}
              className="border-0 bg-transparent p-0 text-hint"
              aria-label={`${item.name} 삭제`}
            >
              <X size={11} weight="bold" />
            </button>
          </span>
        ))}
        <span className="inline-flex items-center gap-1 rounded-pill border border-dashed border-border-2 px-2.5 py-1.5">
          <input
            type="text"
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onCompositionStart={() => {
              composingRef.current = true;
            }}
            onCompositionEnd={() => {
              composingRef.current = false;
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              // 한글/일본어 등 IME 조합 확정을 위한 Enter는 태그 추가로 처리하지 않음
              if (composingRef.current || e.nativeEvent.isComposing || e.keyCode === 229) return;
              e.preventDefault();
              onAdd();
            }}
            placeholder="재료 추가"
            className="chip-input w-[76px] border-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-hint"
          />
          <button
            type="button"
            onClick={onAdd}
            className="border-0 bg-transparent p-0 text-faint"
            aria-label={`${zone.label}에 재료 추가`}
          >
            <Plus size={12} weight="bold" />
          </button>
        </span>
      </div>
    </div>
  );
}
