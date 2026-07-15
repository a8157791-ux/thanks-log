"use client";

import { X } from "@phosphor-icons/react/dist/ssr";
import { useState, useTransition } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { createGroup } from "@/lib/actions/groups";
import { GROUP_ICON_CHOICES, GroupIcon } from "@/lib/group-icons";

export function GroupCreateModal({
  open,
  onClose,
  friendNames,
}: {
  open: boolean;
  onClose: () => void;
  friendNames: string[];
}) {
  const [step, setStep] = useState(0);
  const [icon, setIcon] = useState(GROUP_ICON_CHOICES[0].name);
  const [name, setName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [memberInput, setMemberInput] = useState("");
  const [pending, startTransition] = useTransition();

  function reset() {
    setStep(0);
    setIcon(GROUP_ICON_CHOICES[0].name);
    setName("");
    setSelectedFriends([]);
    setMemberInput("");
  }

  function close() {
    reset();
    onClose();
  }

  function submit() {
    startTransition(async () => {
      await createGroup(name, icon, selectedFriends);
      close();
    });
  }

  return (
    <BottomSheet open={open} onClose={close}>
      {step === 0 && (
        <>
          <h3 className="m-0 font-serif text-[20px] font-normal text-ink">새 감사 그룹 만들기</h3>
          <p className="mt-2 text-[13.5px] text-faint">
            부부, 가족, 친구… 함께 감사를 나눌 사람들을 모아요.
          </p>

          <p className="mb-2.5 mt-6.5 text-[12px] text-hint">아이콘</p>
          <div className="flex flex-wrap gap-2">
            {GROUP_ICON_CHOICES.map(({ name: iconName, Icon }) => (
              <button
                key={iconName}
                type="button"
                onClick={() => setIcon(iconName)}
                className="flex h-11 w-11 items-center justify-center rounded-[12px] border"
                style={{
                  borderColor: icon === iconName ? "var(--color-ink)" : "var(--color-border-2)",
                  background: icon === iconName ? "var(--color-ink)" : "var(--color-card)",
                  color: icon === iconName ? "var(--color-page)" : "var(--color-muted)",
                }}
              >
                <Icon size={20} />
              </button>
            ))}
          </div>

          <p className="mb-2.5 mt-6 text-[12px] text-hint">그룹 이름</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 우리 부부, 가족방"
            className="w-full box-border rounded-input border border-border-2 bg-card px-4 py-3.5 text-[15px] outline-none"
          />

          <button
            type="button"
            disabled={!name.trim()}
            onClick={() => setStep(1)}
            className={
              name.trim()
                ? "mt-6 w-full rounded-input border-0 bg-ink py-3.5 text-[14.5px] font-semibold text-page"
                : "mt-6 w-full rounded-input border-0 bg-[#EBE7DD] py-3.5 text-[14.5px] font-semibold text-hint"
            }
          >
            다음
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <h3 className="m-0 flex items-center gap-2 font-serif text-[20px] font-normal text-ink">
            <GroupIcon name={icon} size={18} />
            {name}
          </h3>
          <p className="mt-2 text-[13.5px] text-faint">함께할 멤버를 초대하세요.</p>

          <div className="mt-5.5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-panel-2 px-3.5 py-2 text-[13px] text-[#5F6E52]">
              나 (나)
            </span>
            {selectedFriends.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-2 rounded-pill px-3.5 py-2 text-[13px] text-white"
                style={{ background: "var(--color-accent)" }}
              >
                {f}
                <button
                  type="button"
                  onClick={() => setSelectedFriends((prev) => prev.filter((x) => x !== f))}
                  className="border-0 bg-transparent p-0 text-white opacity-80"
                >
                  <X size={11} weight="bold" />
                </button>
              </span>
            ))}
          </div>

          {friendNames.length > 0 && (
            <>
              <p className="mb-2 mt-5 text-[12px] text-hint">내 친구에서 선택</p>
              <div className="flex flex-wrap gap-2">
                {friendNames
                  .filter((f) => !selectedFriends.includes(f))
                  .map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSelectedFriends((prev) => [...prev, f])}
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
                setSelectedFriends((prev) => [...prev, memberInput.trim()]);
                setMemberInput("");
              }}
              className="rounded-input border-0 bg-panel-2 px-5 text-sm font-semibold text-[#5F6E52]"
            >
              추가
            </button>
          </div>

          <div className="mt-5.5 flex gap-2.5">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="rounded-input border border-border-2 bg-card px-5 py-3.5 text-sm text-muted"
            >
              이전
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={submit}
              className="flex-1 rounded-input border-0 bg-ink py-3.5 text-[14.5px] font-semibold text-page disabled:opacity-70"
            >
              그룹 만들기
            </button>
          </div>
        </>
      )}
    </BottomSheet>
  );
}
