"use client";

import { CloudCheck, ChatCircleDots } from "@phosphor-icons/react/dist/ssr";
import { useState, useTransition } from "react";
import {
  resetMyData,
  toggleReminder,
  updateAvatar,
  updateNickname,
} from "@/lib/actions/profile";
import { addFriend, createFriendInvite, removeFriend } from "@/lib/actions/friends";
import { shareInviteLink } from "@/lib/kakao/share";
import { uploadPhotoFile } from "@/lib/storage-client";

export type FriendRow = { name: string; color: string };

export function SettingsScreen({
  userId,
  nickname: initialNickname,
  avatarUrl: initialAvatarUrl,
  reminderOn: initialReminderOn,
  friends,
}: {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  reminderOn: boolean;
  friends: FriendRow[];
}) {
  const [nickname, setNickname] = useState(initialNickname);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [reminderOn, setReminderOn] = useState(initialReminderOn);
  const [friendInput, setFriendInput] = useState("");
  const [, startTransition] = useTransition();
  const [sharePending, setSharePending] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  async function onShareInvite() {
    setSharePending(true);
    setShareFeedback(null);
    try {
      const { token, error } = await createFriendInvite();
      if (error || !token) {
        setShareFeedback("초대 링크를 만들지 못했어요. 다시 시도해주세요.");
        return;
      }
      const url = `${window.location.origin}/invite/${token}`;
      const method = await shareInviteLink(url, nickname.trim() || "친구");
      setShareFeedback(
        method === "kakao"
          ? "카카오톡 공유창을 열었어요."
          : method === "webshare"
            ? "공유창을 열었어요."
            : "링크를 복사했어요. 카카오톡에 붙여넣어 보내주세요.",
      );
    } finally {
      setSharePending(false);
    }
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const path = await uploadPhotoFile(file, userId, "avatar");
    setAvatarUrl(URL.createObjectURL(file));
    startTransition(() => updateAvatar(path));
  }

  return (
    <div className="animate-fade-up">
      <h2 className="m-0 font-serif text-[22px] font-normal text-ink">설정</h2>

      <div className="mt-6.5 overflow-hidden rounded-card border border-border bg-card">
        <div className="flex items-center gap-4 border-b border-divider px-5.5 py-5">
          <div
            className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-full text-[18px] font-bold text-page"
            style={{ background: "var(--color-accent)" }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              (nickname || "친").slice(0, 1)
            )}
          </div>
          <div className="flex-1">
            <p className="m-0 text-sm">프로필 사진</p>
            <p className="mt-1 text-[12px] text-hint">감사·함께 화면에 표시돼요</p>
          </div>
          <label className="cursor-pointer rounded-btn border border-border-2 bg-card px-3.5 py-2 text-[13px] text-muted">
            변경
            <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
          </label>
        </div>

        <div className="flex items-center justify-between border-b border-divider px-5.5 py-5">
          <span className="text-sm">닉네임</span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onBlur={() => startTransition(() => updateNickname(nickname))}
            placeholder="이름 입력"
            className="w-36 border-0 bg-transparent text-right text-sm text-muted outline-none"
          />
        </div>

        <div className="flex items-center justify-between border-b border-divider px-5.5 py-5">
          <div>
            <p className="m-0 text-sm">저녁 알림</p>
            <p className="mt-1 text-[12px] text-hint">매일 밤 9시에 알려드려요</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !reminderOn;
              setReminderOn(next);
              startTransition(() => toggleReminder(next));
            }}
            className="relative h-6.5 w-11.5 rounded-pill border-0 transition-colors"
            style={{ background: reminderOn ? "var(--color-accent)" : "#E0DACF" }}
          >
            <span
              className="absolute top-0.5 h-5.5 w-5.5 rounded-full bg-white transition-all"
              style={{ left: reminderOn ? "calc(100% - 24px)" : "2px" }}
            />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-divider px-5.5 py-5">
          <div>
            <p className="m-0 inline-flex items-center gap-1.5 text-sm">
              <CloudCheck size={17} color="var(--color-accent)" />
              클라우드 백업
            </p>
            <p className="mt-1 text-[12px] text-hint">
              카카오 계정에 저장돼 기기를 바꿔도 그대로예요
            </p>
          </div>
          <span className="text-[12px] font-semibold text-accent">동기화됨</span>
        </div>

        <div className="flex flex-col gap-2.5 px-5.5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="m-0 text-sm">카카오톡으로 친구 초대</p>
              <p className="mt-1 text-[12px] text-hint">
                링크를 보내고 상대가 수락하면 진짜 친구로 연결돼요
              </p>
            </div>
            <button
              type="button"
              onClick={onShareInvite}
              disabled={sharePending}
              className="inline-flex items-center gap-1.5 rounded-btn border-0 bg-kakao px-3.5 py-2.5 text-[13px] font-bold text-kakao-ink disabled:opacity-70"
            >
              <ChatCircleDots size={15} weight="fill" />
              {sharePending ? "준비 중..." : "카카오톡"}
            </button>
          </div>
          {shareFeedback && <p className="m-0 text-[12px] text-accent">{shareFeedback}</p>}
        </div>
      </div>

      <div className="mt-3.5 overflow-hidden rounded-card border border-border bg-card">
        <div className="flex items-center justify-between border-b border-divider px-5.5 py-4.5">
          <p className="m-0 text-sm">내 친구</p>
          <span className="text-[12px] text-hint">{friends.length}명</span>
        </div>
        {friends.map((f) => (
          <div
            key={f.name}
            className="flex items-center gap-3 border-b border-[#F5F1E9] px-5.5 py-3.5"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold text-white"
              style={{ background: f.color }}
            >
              {f.name.slice(0, 1)}
            </span>
            <span className="match-input-text flex-1 text-sm text-ink">{f.name}</span>
            <button
              type="button"
              onClick={() => startTransition(() => removeFriend(f.name))}
              className="border-0 bg-transparent text-[13px] text-[#C9B7A8]"
            >
              삭제
            </button>
          </div>
        ))}
        <div className="flex flex-col gap-2.5 px-4.5 py-3.5">
          <div className="flex gap-2">
            <input
              value={friendInput}
              onChange={(e) => setFriendInput(e.target.value)}
              placeholder="이름으로 직접 추가"
              className="min-w-0 flex-1 rounded-input border border-border-2 bg-card px-3.5 py-2.5 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (!friendInput.trim()) return;
                startTransition(() => addFriend(friendInput));
                setFriendInput("");
              }}
              className="rounded-input border-0 bg-panel-2 px-4.5 text-sm font-semibold text-[#5F6E52]"
            >
              추가
            </button>
          </div>
          <p className="m-0 text-[11.5px] leading-[1.5] text-hint">
            아직 땡큐로그를 안 쓰는 친구는 이름만 기록돼요. 실제로 연결하려면 위
            &ldquo;카카오톡으로 친구 초대&rdquo;를 이용해주세요.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          if (confirm("모든 기록을 삭제할까요? 되돌릴 수 없어요.")) {
            startTransition(() => resetMyData());
          }
        }}
        className="mt-5 border-0 bg-transparent py-2 text-[13px] text-destructive"
      >
        모든 데이터 초기화
      </button>
    </div>
  );
}
