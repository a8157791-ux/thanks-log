"use client";

import { useState, useTransition } from "react";
import { completeOnboarding } from "@/lib/actions/profile";

export function OnboardingForm({ prefilled }: { prefilled: string }) {
  const [name, setName] = useState(prefilled);
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(() => completeOnboarding(name));
  }

  return (
    <>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름 또는 별명"
        className="mt-7 w-full box-border border-0 border-b border-border-2 bg-transparent px-0 py-3 text-center font-serif text-[18px] text-ink outline-none focus:border-accent"
      />
      <p className="mt-2.5 text-[12px] text-hint">
        카카오 닉네임을 불러왔어요 · 자유롭게 바꿔도 돼요
      </p>
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="mt-9 rounded-[10px] bg-ink px-10 py-3.5 text-[14.5px] font-semibold text-page disabled:opacity-70"
      >
        일기 시작하기
      </button>
      <p className="mt-4">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="border-0 bg-transparent text-[13px] text-hint"
        >
          건너뛰기
        </button>
      </p>
    </>
  );
}
