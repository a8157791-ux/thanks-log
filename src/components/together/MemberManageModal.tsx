"use client";

import { PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { useState, useTransition } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { addGroupMemberByName, removeGroupMember, updateGroupName } from "@/lib/actions/groups";
import { GroupIcon } from "@/lib/group-icons";
import type { MemberInfo } from "./TogetherScreen";

export function MemberManageModal({
  open,
  onClose,
  groupId,
  groupName,
  groupIcon,
  isOwner,
  members,
  friendNames,
  myUserId,
}: {
  open: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  groupIcon: string;
  isOwner: boolean;
  members: MemberInfo[];
  friendNames: string[];
  myUserId: string;
}) {
  const [memberInput, setMemberInput] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(groupName);
  const [, startTransition] = useTransition();

  const memberNames = new Set(members.map((m) => m.name));

  function saveName() {
    const trimmed = nameDraft.trim();
    setEditingName(false);
    if (!trimmed || trimmed === groupName) {
      setNameDraft(groupName);
      return;
    }
    startTransition(() => updateGroupName(groupId, trimmed));
  }

  if (editingName) {
    return (
      <BottomSheet open={open} onClose={onClose}>
        <div className="flex items-center gap-2">
          <GroupIcon name={groupIcon} size={18} />
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            className="flex-1 rounded-input border border-border-2 bg-card px-3.5 py-2.5 text-[15px] outline-none"
          />
        </div>
        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={() => {
              setNameDraft(groupName);
              setEditingName(false);
            }}
            className="rounded-input border border-border-2 bg-card px-5 py-3 text-sm text-muted"
          >
            취소
          </button>
          <button
            type="button"
            onClick={saveName}
            className="flex-1 rounded-input border-0 bg-ink py-3 text-[14.5px] font-semibold text-page"
          >
            저장
          </button>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h3 className="m-0 flex items-center gap-2 font-serif text-[20px] font-normal text-ink">
        <GroupIcon name={groupIcon} size={18} />
        {groupName} 멤버
        {isOwner && (
          <button
            type="button"
            onClick={() => {
              setNameDraft(groupName);
              setEditingName(true);
            }}
            className="border-0 bg-transparent p-1 text-hint"
          >
            <PencilSimple size={15} />
          </button>
        )}
      </h3>
      <p className="mt-2 text-[13.5px] text-faint">
        이 그룹에 함께할 사람을 추가하거나 내보낼 수 있어요.
      </p>

      <div className="mt-5 flex flex-col gap-0.5">
        {members.map((m) => (
          <div
            key={m.userId ?? m.name}
            className="flex items-center gap-3 border-b border-divider py-3"
          >
            <span
              className="flex h-8.5 w-8.5 items-center justify-center rounded-full text-[13px] font-bold text-white"
              style={{ background: m.color }}
            >
              {m.name.slice(0, 1)}
            </span>
            <span className="flex-1 text-sm text-ink">
              {m.name} {m.isMe && "(나)"}
              {!m.linked && <span className="ml-1.5 text-[12px] text-hint">· 초대 대기중</span>}
            </span>
            {m.userId !== myUserId && (
              <button
                type="button"
                onClick={() =>
                  startTransition(() => removeGroupMember(groupId, m.userId, m.name))
                }
                className="border-0 bg-transparent text-[13px] text-[#C9B7A8]"
              >
                내보내기
              </button>
            )}
          </div>
        ))}
      </div>

      {friendNames.length > 0 && (
        <>
          <p className="mb-2 mt-5.5 text-[12px] text-hint">내 친구에서 추가</p>
          <div className="flex flex-wrap gap-2">
            {friendNames
              .filter((f) => !memberNames.has(f))
              .map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => startTransition(() => addGroupMemberByName(groupId, f))}
                  className="rounded-pill border border-border-2 bg-card px-3.5 py-2 text-[13px] text-muted"
                >
                  {f}
                </button>
              ))}
          </div>
        </>
      )}

      <p className="mb-2 mt-5 text-[12px] text-hint">직접 추가</p>
      <div className="flex gap-2">
        <input
          value={memberInput}
          onChange={(e) => setMemberInput(e.target.value)}
          placeholder="멤버 이름"
          className="flex-1 rounded-input border border-border-2 bg-card px-3.5 py-3 text-[14.5px] outline-none"
        />
        <button
          type="button"
          onClick={() => {
            if (!memberInput.trim()) return;
            startTransition(() => addGroupMemberByName(groupId, memberInput));
            setMemberInput("");
          }}
          className="rounded-input border-0 bg-panel-2 px-5 text-sm font-semibold text-[#5F6E52]"
        >
          추가
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-6 w-full rounded-input border-0 bg-ink py-3.5 text-[14.5px] font-semibold text-page"
      >
        완료
      </button>
    </BottomSheet>
  );
}
