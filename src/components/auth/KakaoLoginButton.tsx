"use client";

import { ChatCircleDots } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

export function KakaoLoginButton({
  className,
  next,
}: {
  className?: string;
  /** Path to return to after login (e.g. an invite link). Must start with "/". */
  next?: string;
}) {
  const [pending, setPending] = useState(false);

  async function login() {
    if (!isSupabaseConfigured) {
      alert("Supabase 설정이 아직 안 되어 있어요. README의 설정 가이드를 먼저 진행해주세요.");
      return;
    }
    setPending(true);
    const supabase = createClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (next?.startsWith("/")) callbackUrl.searchParams.set("next", next);
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: callbackUrl.toString(),
        scopes: "profile_nickname profile_image",
        // Supabase's gotrue always prepends its own default scope (account_email) to
        // whatever `scopes` is set above, which trips KOE205 when the Kakao app hasn't
        // enabled that consent item. Re-declaring `scope` via queryParams wins because
        // it's appended last in the final authorize URL, overriding gotrue's value.
        queryParams: { scope: "profile_nickname profile_image" },
      },
    });
  }

  return (
    <button
      type="button"
      onClick={login}
      disabled={pending}
      className={
        className ??
        "inline-flex items-center gap-2.5 rounded-[12px] bg-kakao px-[26px] py-[15px] text-[15.5px] font-bold text-kakao-ink disabled:opacity-70"
      }
    >
      <ChatCircleDots size={19} weight="fill" />
      카카오로 시작하기
    </button>
  );
}
