"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  CalendarBlank,
  CalendarPlus,
  CaretLeft,
  CaretRight,
  ListBullets,
  Star,
  UserPlus,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { buildMonthCells } from "@/lib/archive";
import { itemMark } from "@/lib/gratitude";
import { MoodFace } from "@/components/today/MoodFace";
import { PhotoSlider } from "@/components/ui/PhotoSlider";
import { CenterModal } from "@/components/ui/BottomSheet";
import { FeedCard } from "@/components/together/FeedCard";
import { GroupCreateModal } from "@/components/together/GroupCreateModal";
import { MemberManageModal } from "@/components/together/MemberManageModal";
import { GroupIcon } from "@/lib/group-icons";
import { addScheduleEvent, removeScheduleEvent } from "@/lib/actions/schedule";
import { setDefaultRecord } from "@/lib/actions/profile";
import type { FeedEntry, GroupSummary, MemberInfo } from "@/components/together/TogetherScreen";
import type { StickerItem } from "@/lib/stickers";
import type { ScheduleItem } from "@/lib/types";

type ViewMode = "calendar" | "feed";

export function RecordScreen({
  groups,
  activeGroup,
  defaultGroupId,
  members,
  view,
  feed,
  schedule,
  todayKey,
  friendNames,
  myUserId,
  placeholderStickers,
}: {
  groups: GroupSummary[];
  activeGroup: GroupSummary | null;
  defaultGroupId: string | null;
  members: MemberInfo[];
  view: ViewMode;
  feed: FeedEntry[];
  schedule: ScheduleItem[];
  todayKey: string;
  friendNames: string[];
  myUserId: string;
  placeholderStickers: StickerItem[];
}) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [filter, setFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [detailKey, setDetailKey] = useState<string | null>(null);
  const [myDefault, setMyDefault] = useState<string | null>(defaultGroupId);
  const [, startDefaultTransition] = useTransition();

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(schedule);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState(todayKey);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const tempIdRef = useRef(0);

  const activeGroupId = activeGroup?.id ?? null;

  function handleSetDefault() {
    setMyDefault(activeGroupId);
    startDefaultTransition(async () => {
      await setDefaultRecord(activeGroupId);
    });
  }

  const eventsByDate = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    for (const s of scheduleItems) {
      const list = map.get(s.event_date) ?? [];
      list.push(s);
      map.set(s.event_date, list);
    }
    return map;
  }, [scheduleItems]);

  function submitAddEvent() {
    const title = eventTitle.trim();
    if (!title || !eventDate) return;
    tempIdRef.current += 1;
    const tempId = `temp-${tempIdRef.current}`;
    const optimistic: ScheduleItem = {
      id: tempId,
      user_id: myUserId,
      group_id: activeGroupId,
      title,
      event_date: eventDate,
      created_at: "",
    };
    setScheduleItems((prev) => [...prev, optimistic]);
    setEventTitle("");
    startTransition(async () => {
      const { error } = await addScheduleEvent(title, eventDate, activeGroupId);
      if (error) {
        setScheduleItems((prev) => prev.filter((s) => s.id !== tempId));
        setScheduleError(error);
      }
    });
  }

  function handleRemoveEvent(item: ScheduleItem) {
    setScheduleItems((prev) => prev.filter((s) => s.id !== item.id));
    if (item.id.startsWith("temp-")) return;
    startTransition(async () => {
      const { error } = await removeScheduleEvent(item.id);
      if (error) {
        setScheduleItems((prev) => [...prev, item]);
        setScheduleError(error);
      }
    });
  }

  const entriesByDate = useMemo(() => {
    const map = new Map<string, FeedEntry[]>();
    for (const e of feed) {
      const list = map.get(e.entryDate) ?? [];
      list.push(e);
      map.set(e.entryDate, list);
    }
    return map;
  }, [feed]);

  const sortedKeys = useMemo(() => [...entriesByDate.keys()].sort().reverse(), [entriesByDate]);
  const [selectedKey, setSelectedKey] = useState<string | null>(
    entriesByDate.has(todayKey) ? todayKey : sortedKeys[0] ?? null,
  );

  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const cells = buildMonthCells(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    todayKey,
    (key) => (entriesByDate.get(key)?.length ?? 0) > 0,
  );

  const selectedEntries = selectedKey ? entriesByDate.get(selectedKey) ?? [] : [];
  const detailEntries = detailKey ? entriesByDate.get(detailKey) ?? [] : [];

  const filteredFeed = useMemo(
    () => (filter === "all" ? feed : feed.filter((e) => e.authorUserId === filter)),
    [feed, filter],
  );

  const gParam = activeGroup ? activeGroup.id : "personal";

  return (
    <div className="animate-fade-up">
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
        <Link
          href={`/archive?g=personal&view=${view}`}
          className={
            !activeGroup
              ? "inline-flex flex-none items-center gap-1.5 whitespace-nowrap rounded-pill border-0 bg-ink px-3.5 py-2 text-[13px] text-page"
              : "inline-flex flex-none items-center gap-1.5 whitespace-nowrap rounded-pill border border-border-2 bg-card px-3.5 py-2 text-[13px] text-muted"
          }
        >
          내 기록
        </Link>
        {groups.map((g) => (
          <Link
            key={g.id}
            href={`/archive?g=${g.id}&view=${view}`}
            className={
              activeGroup?.id === g.id
                ? "inline-flex flex-none items-center gap-1.5 whitespace-nowrap rounded-pill border-0 bg-ink px-3.5 py-2 text-[13px] text-page"
                : "inline-flex flex-none items-center gap-1.5 whitespace-nowrap rounded-pill border border-border-2 bg-card px-3.5 py-2 text-[13px] text-muted"
            }
          >
            <GroupIcon name={g.icon} size={14} />
            {g.name}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex-none whitespace-nowrap rounded-pill border border-dashed border-[#D5CFC2] bg-transparent px-3.5 py-2 text-[13px] text-hint"
        >
          + 그룹
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="m-0 text-[12px] text-hint">
          {activeGroup ? "그룹 멤버들과 함께 남긴 기록이에요." : "나만 보는 개인 기록이에요."}
        </p>
        <div className="inline-flex flex-none items-center gap-0.5 rounded-pill border border-border-2 bg-card p-0.5">
          <Link
            href={`/archive?g=${gParam}&view=calendar`}
            className={
              view === "calendar"
                ? "flex items-center gap-1 rounded-pill bg-ink px-2.5 py-1.5 text-[12px] text-page"
                : "flex items-center gap-1 rounded-pill px-2.5 py-1.5 text-[12px] text-faint"
            }
          >
            <CalendarBlank size={13} />
            캘린더
          </Link>
          <Link
            href={`/archive?g=${gParam}&view=feed`}
            className={
              view === "feed"
                ? "flex items-center gap-1 rounded-pill bg-ink px-2.5 py-1.5 text-[12px] text-page"
                : "flex items-center gap-1 rounded-pill px-2.5 py-1.5 text-[12px] text-faint"
            }
          >
            <ListBullets size={13} />
            피드
          </Link>
        </div>
      </div>

      <div className="mt-1.5 flex items-center justify-end">
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

      {activeGroup && (
        <div className="mt-3.5 flex items-center gap-4 rounded-panel border border-border bg-card px-6 py-5.5">
          <div className="flex">
            {members.map((m, i) => (
              <span
                key={m.userId ?? m.name}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-card text-[13px] font-bold text-white"
                style={{ background: m.color, marginLeft: i === 0 ? 0 : -10 }}
              >
                {m.name.slice(0, 1)}
              </span>
            ))}
          </div>
          <div className="flex-1">
            <p className="m-0 text-sm font-semibold">{activeGroup.name}</p>
            <p className="mt-1 text-[12.5px] text-faint">구성원 {members.length}명</p>
          </div>
          <button
            type="button"
            onClick={() => setMemberModalOpen(true)}
            className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap rounded-btn border border-border-2 bg-card px-3.5 py-2 text-[12.5px] text-muted"
          >
            <UserPlus size={14} />
            멤버
          </button>
        </div>
      )}

      <div className="mt-3.5 rounded-panel border border-border bg-card px-6 py-5.5">
        <h3 className="m-0 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink">
          <CalendarPlus size={15} color="var(--color-accent-2)" />
          {activeGroup ? "공유 일정" : "내 일정"}
        </h3>
        <p className="mt-1 text-[12px] text-faint">
          {activeGroup ? "이 그룹 멤버들과 같이 보는 일정이에요." : "나만 보는 개인 일정이에요."}
        </p>

        {scheduleError && (
          <div className="mt-2.5 flex items-start justify-between gap-2 rounded-card border border-[#E8B4B4] bg-[#FBEAEA] px-3.5 py-2 text-[12px] leading-[1.5] text-[#B23A3A]">
            <span>저장에 실패했어요: {scheduleError}</span>
            <button
              type="button"
              onClick={() => setScheduleError(null)}
              className="shrink-0 border-0 bg-transparent p-0 text-[#B23A3A]"
              aria-label="에러 메시지 닫기"
            >
              <X size={11} weight="bold" />
            </button>
          </div>
        )}

        <div className="mt-3.5 flex flex-col gap-2">
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full min-w-0 rounded-input border border-border-2 bg-page px-3 py-2.5 text-[13px] text-ink outline-none"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                if (e.nativeEvent.isComposing) return;
                e.preventDefault();
                submitAddEvent();
              }}
              placeholder="무슨 일정이에요?"
              className="min-w-0 flex-1 rounded-input border border-border-2 bg-page px-3.5 py-2.5 text-[13px] text-ink outline-none"
            />
            <button
              type="button"
              onClick={submitAddEvent}
              className="flex-none rounded-input border-0 bg-ink px-4 text-[13px] font-semibold text-page"
            >
              추가
            </button>
          </div>
        </div>
      </div>

      {view === "calendar" ? (
        <>
          <div className="mt-5.5 flex items-center justify-between">
            <h2 className="m-0 font-serif text-[20px] font-normal text-ink">
              {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setMonthOffset(0);
                  setSelectedKey(todayKey);
                }}
                className="h-8 rounded-btn border border-border bg-card px-3.5 text-[13px] text-muted"
              >
                오늘
              </button>
              <button
                type="button"
                onClick={() => setMonthOffset((m) => m - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-btn border border-border bg-card text-muted"
              >
                <CaretLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setMonthOffset((m) => m + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-btn border border-border bg-card text-muted"
              >
                <CaretRight size={14} />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[12px] text-hint">
            {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {cells.map((cell, i) => {
              if (cell.kind === "empty") return <div key={i} />;
              const dayEntries = entriesByDate.get(cell.key) ?? [];
              const dayEvents = eventsByDate.get(cell.key) ?? [];
              const solo = dayEntries[0];
              return (
                <button
                  key={cell.key}
                  type="button"
                  disabled={!cell.hasEntry && dayEvents.length === 0}
                  onClick={() => setSelectedKey(cell.key)}
                  style={{ aspectRatio: "0.72" }}
                  className={
                    cell.hasEntry || dayEvents.length > 0
                      ? `flex flex-col gap-1 rounded-[11px] bg-card p-1.5 ${
                          selectedKey === cell.key ? "border-2 border-accent" : "border border-[#EAE4DA]"
                        }`
                      : "flex items-start rounded-[11px] border border-dashed border-[#ECE7DD] p-1.5"
                  }
                >
                  <div className="flex w-full items-center justify-between px-0.5">
                    <span
                      className={`font-serif text-[11px] font-bold ${
                        cell.isToday ? "text-accent" : cell.hasEntry ? "text-[#B5A996]" : "text-[#CFC8BA]"
                      }`}
                    >
                      {cell.day}
                    </span>
                    {cell.hasEntry && !activeGroup && <MoodFace mood={solo.mood} size={16} />}
                  </div>
                  {dayEvents.length > 0 && (
                    <span
                      className="block w-full truncate rounded-[4px] px-1 text-left text-[9px] leading-[13px]"
                      style={{
                        background: "color-mix(in srgb, var(--color-accent-2) 16%, transparent)",
                        color: "var(--color-accent-2)",
                      }}
                      title={dayEvents.map((s) => s.title).join(", ")}
                    >
                      {dayEvents.length > 1 ? `${dayEvents[0].title} 외 ${dayEvents.length - 1}` : dayEvents[0].title}
                    </span>
                  )}
                  {cell.hasEntry && !activeGroup && (
                    <div className="grid min-h-0 flex-1 grid-cols-2 gap-0.5 overflow-hidden rounded-[7px]">
                      {solo.photoUrls.length > 0 ? (
                        solo.photoUrls
                          .slice(0, 3)
                          .map((src, idx) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={idx}
                              src={src}
                              alt=""
                              className={`h-full w-full object-cover ${idx === 0 && solo.photoUrls.length > 1 ? "row-span-2" : "col-span-2"}`}
                            />
                          ))
                      ) : (
                        <div className="col-span-2 rounded-[7px]" style={{ background: "color-mix(in srgb, var(--color-accent) 9%, transparent)" }} />
                      )}
                    </div>
                  )}
                  {cell.hasEntry && activeGroup && (
                    <div className="mt-auto flex flex-wrap items-center gap-1 px-0.5 pb-0.5">
                      {dayEntries.slice(0, 4).map((e) => (
                        <span
                          key={e.entryId}
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: e.authorColor }}
                          title={e.authorName}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-9">
            {selectedKey && (eventsByDate.get(selectedKey)?.length ?? 0) > 0 && (
              <div className="mb-4 flex flex-col gap-2">
                {eventsByDate.get(selectedKey)!.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center gap-2.5 rounded-btn border border-border bg-card px-3.5 py-2.5"
                  >
                    <CalendarPlus size={15} color="var(--color-accent-2)" />
                    <span className="flex-1 text-[13.5px] text-ink">{ev.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEvent(ev)}
                      className="border-0 bg-transparent p-0 text-hint"
                      aria-label={`${ev.title} 일정 삭제`}
                    >
                      <X size={12} weight="bold" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {selectedEntries.length === 0 ? (
              (eventsByDate.get(selectedKey ?? "")?.length ?? 0) === 0 && (
                <p className="py-6 text-center text-[13.5px] text-hint">기록이 있는 날짜를 눌러보세요.</p>
              )
            ) : !activeGroup ? (
              <div className="animate-fade-up">
                <p className="m-0 mb-3.5 font-serif text-[16px] text-ink">
                  {selectedEntries[0].dateLabel}
                </p>
                {selectedEntries[0].photoUrls.length > 0 && (
                  <PhotoSlider
                    srcs={selectedEntries[0].photoUrls}
                    maxHeight={320}
                    onClick={() => setDetailKey(selectedKey)}
                  />
                )}
                <div className="mt-3.5 flex flex-col gap-2.5">
                  {selectedEntries[0].items.map((text, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setDetailKey(selectedKey)}
                      className="flex w-full items-start gap-3.5 rounded-[12px] border border-border bg-card px-4.5 py-4 text-left"
                    >
                      <span className="font-serif text-[15px] text-hint">{itemMark(i)}</span>
                      <span className="flex-1 text-[15px] leading-[1.6] text-ink">{text}</span>
                      <span className="text-[18px] leading-[1.4] text-[#C9C2B3]">›</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-fade-up flex flex-col gap-3.5">
                {selectedEntries.map((entry) => (
                  <FeedCard key={entry.entryId} entry={entry} placeholderStickers={placeholderStickers} />
                ))}
              </div>
            )}
          </div>

          <CenterModal open={!!detailKey} onClose={() => setDetailKey(null)}>
            {detailEntries[0] && detailKey && (
              <>
                <div className="flex items-baseline justify-between">
                  <h3 className="m-0 font-serif text-[18px] font-normal text-ink">
                    {detailEntries[0].dateLabel}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setDetailKey(null)}
                    className="border-0 bg-transparent text-[13px] text-faint"
                  >
                    닫기
                  </button>
                </div>
                <ol className="mt-5.5 flex list-none flex-col gap-3.5 p-0">
                  {detailEntries[0].items.map((text, i) => (
                    <li key={i} className="flex gap-3 text-[15px] leading-[1.65]">
                      <span className="font-serif text-hint">{itemMark(i)}</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ol>
                {detailEntries[0].photoUrls.length > 0 && (
                  <PhotoSlider srcs={detailEntries[0].photoUrls} maxHeight={280} />
                )}
              </>
            )}
          </CenterModal>
        </>
      ) : (
        <>
          {activeGroup && (
            <div className="no-scrollbar mt-5.5 flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={
                  filter === "all"
                    ? "flex-none whitespace-nowrap rounded-pill border-0 bg-ink px-4 py-2 text-[13px] text-page"
                    : "flex-none whitespace-nowrap rounded-pill border border-border-2 bg-card px-4 py-2 text-[13px] text-faint"
                }
              >
                전체
              </button>
              {members
                .filter((m) => m.linked)
                .map((m) => (
                  <button
                    key={m.userId}
                    type="button"
                    onClick={() => setFilter(m.userId!)}
                    className={
                      filter === m.userId
                        ? "flex-none whitespace-nowrap rounded-pill border-0 bg-ink px-4 py-2 text-[13px] text-page"
                        : "flex-none whitespace-nowrap rounded-pill border border-border-2 bg-card px-4 py-2 text-[13px] text-faint"
                    }
                  >
                    {m.name}
                  </button>
                ))}
            </div>
          )}

          <div className="mt-5.5 flex flex-col gap-3.5">
            {filteredFeed.length === 0 && (
              <p className="py-10 text-center text-[13.5px] text-hint">
                {activeGroup ? "아직 이 그룹에 남겨진 감사 기록이 없어요." : "아직 남긴 기록이 없어요."}
              </p>
            )}
            {filteredFeed.map((entry) => (
              <FeedCard
                key={entry.entryId}
                entry={entry}
                placeholderStickers={placeholderStickers}
                interactive={!!activeGroup}
              />
            ))}
          </div>
        </>
      )}

      <GroupCreateModal open={createOpen} onClose={() => setCreateOpen(false)} friendNames={friendNames} />
      {activeGroup && (
        <MemberManageModal
          open={memberModalOpen}
          onClose={() => setMemberModalOpen(false)}
          groupId={activeGroup.id}
          groupName={activeGroup.name}
          groupIcon={activeGroup.icon}
          isOwner={activeGroup.owner_id === myUserId}
          members={members}
          friendNames={friendNames}
          myUserId={myUserId}
        />
      )}
    </div>
  );
}
