"use client";

import { ChatCircleDots, Heart } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useState, useTransition } from "react";
import { KakaoLoginButton } from "@/components/auth/KakaoLoginButton";
import { acceptFriendInvite } from "@/lib/actions/friends";

type PreviewStatus = "pending" | "accepted" | "revoked" | "not_found";

export function InviteAcceptScreen({
  token,
  inviterName,
  previewStatus,
  isSelf,
  isLoggedIn,
}: {
  token: string;
  inviterName: string | null;
  previewStatus: PreviewStatus;
  isSelf: boolean;
  isLoggedIn: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<string | null>(null);

  function accept() {
    setError(null);
    startTransition(async () => {
      const result = await acceptFriendInvite(token);
      if (result.error) {
        setError(result.error);
        return;
      }
      setAccepted(result.inviterName);
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-6">
      <div className="w-full max-w-[400px] animate-fade-up text-center">
        <div className="mb-[22px] inline-flex items-center gap-1.5 rounded-pill bg-panel-2 px-3.5 py-1.5 text-[12.5px] font-semibold text-[#5F6E52]">
          <Heart size={13} weight="fill" />
          땡큐로그 친구 초대
        </div>

        {accepted ? (
          <>
            <h1 className="font-serif text-[22px] font-normal leading-relaxed text-ink">
              {accepted}님과 친구가 됐어요
            </h1>
            <p className="mt-3 text-[14px] leading-[1.7] text-faint">
              이제 서로의 감사를 나누고 함께 그룹을 만들 수 있어요.
            </p>
            <Link
              href="/together"
              className="mt-8 inline-flex w-full items-center justify-center rounded-[14px] bg-ink px-6 py-4 text-[15px] font-semibold text-page"
            >
              함께 보러 가기
            </Link>
          </>
        ) : previewStatus === "not_found" ? (
          <>
            <h1 className="font-serif text-[22px] font-normal leading-relaxed text-ink">
              유효하지 않은 링크예요
            </h1>
            <p className="mt-3 text-[14px] leading-[1.7] text-faint">
              초대 링크가 만료됐거나 잘못됐어요.
              <br />
              상대방에게 새 링크를 받아보세요.
            </p>
          </>
        ) : previewStatus === "revoked" ? (
          <>
            <h1 className="font-serif text-[22px] font-normal leading-relaxed text-ink">
              취소된 초대예요
            </h1>
            <p className="mt-3 text-[14px] leading-[1.7] text-faint">
              {inviterName}님이 이 초대 링크를 취소했어요.
            </p>
          </>
        ) : previewStatus === "accepted" ? (
          <>
            <h1 className="font-serif text-[22px] font-normal leading-relaxed text-ink">
              이미 사용된 링크예요
            </h1>
            <p className="mt-3 text-[14px] leading-[1.7] text-faint">
              이 초대 링크는 이미 다른 사람이 수락했어요.
            </p>
          </>
        ) : isSelf ? (
          <>
            <h1 className="font-serif text-[22px] font-normal leading-relaxed text-ink">
              내가 만든 초대 링크예요
            </h1>
            <p className="mt-3 text-[14px] leading-[1.7] text-faint">
              카카오톡으로 친구에게 이 링크를 보내
              <br />
              직접 열어서 수락하도록 해주세요.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-[22px] font-normal leading-relaxed text-ink">
              {inviterName}님이
              <br />
              친구 초대를 보냈어요
            </h1>
            <p className="mt-3 text-[14px] leading-[1.7] text-faint">
              수락하면 서로의 감사일기를 나누고
              <br />
              함께 그룹을 만들 수 있어요.
            </p>

            {error && (
              <p className="mt-5 rounded-[10px] bg-[#F6ECEA] px-4 py-3 text-center text-[13px] text-[#9A6A5F]">
                {error}
              </p>
            )}

            <div className="mt-8">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={accept}
                  disabled={pending}
                  className="w-full rounded-[14px] bg-ink px-6 py-4 text-[15px] font-semibold text-page disabled:opacity-70"
                >
                  {pending ? "연결하는 중..." : "친구 수락하기"}
                </button>
              ) : (
                <KakaoLoginButton
                  next={`/invite/${token}`}
                  className="flex w-full items-center justify-center gap-2.5 rounded-[14px] bg-kakao p-4 text-[15.5px] font-bold text-kakao-ink disabled:opacity-70"
                />
              )}
            </div>
            {!isLoggedIn && (
              <p className="mt-5 flex items-center justify-center gap-1.5 text-[12.5px] text-hint">
                <ChatCircleDots size={14} />
                카카오 로그인 후 자동으로 돌아와요
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
