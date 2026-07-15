"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { UserPlus } from "@phosphor-icons/react/dist/ssr";
import { FeedCard } from "./FeedCard";
import { GroupCreateModal } from "./GroupCreateModal";
import { MemberManageModal } from "./MemberManageModal";
import { GroupIcon } from "@/lib/group-icons";
import type { GroupSummary, MemberInfo } from "@/lib/group-data";

export type { GroupSummary, MemberInfo };
export type FeedComment = {
  id: string;
  authorName: string;
  authorColor: string;
  body: string | null;
  sticker: string | null;
  mine: boolean;
};
export type FeedEntry = {
  entryId: string;
  authorUserId: string;
  authorName: string;
  authorColor: string;
  dateLabel: string;
  items: string[];
  photoUrls: string[];
  heartCount: number;
  heartedByMe: boolean;
  comments: FeedComment[];
};

export function TogetherScreen({
  groups,
  activeGroup,
  members,
  feed,
  friendNames,
  myUserId,
}: {
  groups: GroupSummary[];
  activeGroup: GroupSummary | null;
  members: MemberInfo[];
  feed: FeedEntry[];
  friendNames: string[];
  myUserId: string;
}) {
  const [filter, setFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);

  const filtered = useMemo(
    () => (filter === "all" ? feed : feed.filter((f) => f.authorUserId === filter)),
    [feed, filter],
  );

  if (!activeGroup) {
    return (
      <div className="animate-fade-up">
        <div className="rounded-card border border-dashed border-border-2 bg-card px-6 py-14 text-center">
          <p className="m-0 text-[15px] text-muted">
            아직 그룹이 없어요. 가족, 친구와 함께 쓸 첫 그룹을 만들어보세요.
          </p>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-5 rounded-btn border-0 bg-ink px-5 py-3 text-sm font-semibold text-page"
          >
            + 그룹 만들기
          </button>
        </div>
        <GroupCreateModal open={createOpen} onClose={() => setCreateOpen(false)} friendNames={friendNames} />
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {groups.map((g) => (
          <Link
            key={g.id}
            href={`/together?g=${g.id}`}
            className={
              g.id === activeGroup.id
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

      <div className="mt-4 flex items-center gap-4 rounded-panel border border-border bg-card px-6 py-5.5">
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
          <p className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] text-faint">
            구성원 {members.length}명
          </p>
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

      <div className="mt-5.5 flex flex-col gap-3.5">
        {filtered.length === 0 && (
          <p className="py-10 text-center text-[13.5px] text-hint">
            아직 이 그룹에 남겨진 감사 기록이 없어요.
          </p>
        )}
        {filtered.map((entry) => (
          <FeedCard key={entry.entryId} entry={entry} />
        ))}
      </div>

      <GroupCreateModal open={createOpen} onClose={() => setCreateOpen(false)} friendNames={friendNames} />
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
    </div>
  );
}
