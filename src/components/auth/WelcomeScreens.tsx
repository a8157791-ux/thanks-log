"use client";

import {
  ArrowLeft,
  ChatCircle,
  Heart,
  Leaf,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { KakaoLoginButton } from "@/components/auth/KakaoLoginButton";

type View = "intro" | "auth";

const SLIDES = [
  {
    title: "하루 세 가지,\n작은 감사를 남겨요",
    body: "매일 밤 딱 세 줄. 부담 없이 적다 보면\n마음이 한결 가벼워져요.",
  },
  {
    title: "사진과 함께\n그날을 오래 담아요",
    body: "그날의 장면을 여러 장 남기고,\n옆으로 넘겨보며 다시 추억해요.",
  },
  {
    title: "가족·친구와\n마음을 나눠요",
    body: "서로의 감사에 하트와 스티커로 반응하고,\n함께 '마음 밭'을 키워가요.",
  },
];

function DiaryCardVisual() {
  return (
    <div className="w-full rounded-[28px] bg-[#EAF0E4] px-6 py-10">
      <div className="rounded-[20px] bg-card px-6 py-6 shadow-hero">
        <p className="text-[12px] text-hint-2">2026년 7월 15일 수요일</p>
        <ol className="mt-4 flex list-none flex-col gap-3.5 p-0">
          {[
            ["一", "아침 햇살에 눈뜬 조용한 순간"],
            ["二", "친구가 보내준 다정한 메시지"],
            ["三", "퇴근길 노을이 유난히 예뻤음"],
          ].map(([num, text]) => (
            <li key={num} className="flex gap-2.5 text-[14.5px] leading-[1.5]">
              <span className="font-serif text-hint">{num}</span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function PhotosVisual() {
  return (
    <div className="relative h-[250px] w-full">
      <div className="absolute left-[8%] top-3 w-[152px] -rotate-[7deg] rounded-[10px] bg-card p-2.5 pb-8 shadow-hero">
        <div className="flex h-[148px] items-center justify-center rounded-[6px] bg-gradient-to-br from-[#EBF1E4] to-[#D7E3CB]">
          <Image
            src="/stickers/placeholder/heart-eyes.png"
            alt=""
            width={64}
            height={64}
          />
        </div>
      </div>
      <div className="absolute right-[8%] top-12 w-[152px] rotate-[6deg] rounded-[10px] bg-card p-2.5 pb-8 shadow-hero">
        <div className="flex h-[148px] items-center justify-center rounded-[6px] bg-gradient-to-br from-[#F4EDE6] to-[#E7D9C8]">
          <Image
            src="/stickers/placeholder/party.png"
            alt=""
            width={64}
            height={64}
          />
        </div>
      </div>
    </div>
  );
}

function FriendCardVisual() {
  return (
    <div className="w-full rounded-[28px] bg-[#EAF0E4] px-6 py-10">
      <div className="rounded-[20px] bg-card px-6 py-6 shadow-hero">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B08968] font-serif text-[15px] text-white">
            서
          </span>
          <div className="text-left">
            <p className="text-[14px] font-semibold text-ink">서연</p>
            <p className="text-[11.5px] text-hint-2">오늘 저녁</p>
          </div>
        </div>
        <ol className="mt-4 flex list-none flex-col gap-2.5 p-0 text-left">
          {[
            ["一", "같이 걸어준 저녁 산책"],
            ["二", "따뜻했던 커피 한 잔"],
          ].map(([num, text]) => (
            <li key={num} className="flex gap-2.5 text-[14px] leading-[1.5]">
              <span className="font-serif text-hint">{num}</span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex items-center gap-4 border-t border-divider pt-3.5 text-[13px] text-hint">
          <span className="inline-flex items-center gap-1">
            <Heart size={15} weight="fill" color="var(--color-heart)" />4
          </span>
          <span className="inline-flex items-center gap-1">
            <ChatCircle size={15} />2
          </span>
        </div>
      </div>
      <p className="mt-4 inline-flex items-center gap-1.5 rounded-pill bg-card px-3.5 py-2 text-[12.5px] font-semibold text-[#5F6E52]">
        <Leaf size={14} weight="fill" />
        마음 밭 자라는 중
      </p>
    </div>
  );
}

const VISUALS = [DiaryCardVisual, PhotosVisual, FriendCardVisual];

export function WelcomeScreens({ authError }: { authError: boolean }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  // A failed Kakao login lands back on `/?auth_error=1`; drop the user straight
  // onto the auth view so the error is actually visible next to the retry button.
  const [view, setView] = useState<View>(authError ? "auth" : "intro");
  const [slideIdx, setSlideIdx] = useState(0);

  function goSlide(i: number) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  function onScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    setSlideIdx(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#EFEBE2] sm:p-6">
      <div className="relative flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-page sm:h-[860px] sm:max-h-[90vh] sm:rounded-[34px] sm:shadow-hero">
        {view === "intro" ? (
          <>
            <header className="flex items-center justify-between px-7 pt-7">
              <p className="font-serif text-[21px] font-bold tracking-heading text-ink">
                땡큐로그
              </p>
              <button
                type="button"
                onClick={() => setView("auth")}
                className="border-0 bg-transparent text-[14px] text-hint-2"
              >
                건너뛰기
              </button>
            </header>

            <div
              ref={scrollerRef}
              onScroll={onScroll}
              className="no-scrollbar flex flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
            >
              {SLIDES.map((slide, i) => {
                const Visual = VISUALS[i];
                return (
                  <section
                    key={slide.title}
                    className="flex flex-[0_0_100%] snap-center flex-col items-center justify-center px-8"
                  >
                    <div className="flex w-full flex-1 items-center justify-center">
                      <Visual />
                    </div>
                    <h2 className="mt-6 whitespace-pre-line text-center font-serif text-[27px] font-normal leading-[1.4] tracking-heading text-ink">
                      {slide.title}
                    </h2>
                    <p className="mb-8 mt-4 whitespace-pre-line text-center text-[14.5px] leading-[1.7] text-faint">
                      {slide.body}
                    </p>
                  </section>
                );
              })}
            </div>

            <div className="flex justify-center gap-2 pb-5">
              {SLIDES.map((slide, i) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => goSlide(i)}
                  aria-label={`${i + 1}번째 슬라이드로 이동`}
                  aria-current={i === slideIdx}
                  className={`h-[7px] rounded-pill border-0 transition-all duration-[250ms] ${
                    i === slideIdx ? "w-[22px] bg-accent" : "w-[7px] bg-[#D6D0C3]"
                  }`}
                />
              ))}
            </div>

            <div className="px-7 pb-8">
              {slideIdx < SLIDES.length - 1 ? (
                <button
                  type="button"
                  onClick={() => goSlide(slideIdx + 1)}
                  className="w-full rounded-[14px] bg-kakao p-4 text-[15.5px] font-bold text-kakao-ink"
                >
                  다음
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setView("auth")}
                  className="w-full rounded-[14px] bg-kakao p-4 text-[15.5px] font-bold text-kakao-ink"
                >
                  카카오로 시작하기
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <header className="px-6 pt-6">
              <button
                type="button"
                onClick={() => setView("intro")}
                aria-label="이전으로"
                className="flex h-10 w-10 items-center justify-center rounded-full border-0 bg-transparent text-faint"
              >
                <ArrowLeft size={22} />
              </button>
            </header>

            <div className="flex flex-1 flex-col items-center justify-center px-8">
              <h1 className="font-serif text-[34px] font-normal tracking-heading text-ink">
                땡큐로그
              </h1>
              <p className="mt-4 text-center text-[15px] leading-[1.7] text-faint">
                오늘 고마웠던 세 가지를 기록하고
                <br />
                사랑하는 사람들과 나눠요.
              </p>
            </div>

            <div className="px-7 pb-10">
              {authError && (
                <p className="mb-4 rounded-[10px] bg-[#F6ECEA] px-4 py-3 text-center text-[13px] text-[#9A6A5F]">
                  로그인에 실패했어요. 다시 시도해주세요.
                </p>
              )}
              <KakaoLoginButton className="flex w-full items-center justify-center gap-2.5 rounded-[14px] bg-kakao p-4 text-[15.5px] font-bold text-kakao-ink disabled:opacity-70" />
              <Link
                href="/demo"
                className="mt-5 block w-full text-center text-[14px] text-faint"
              >
                먼저 둘러볼게요
              </Link>
              <p className="mt-5 text-center text-[12.5px] leading-[1.6] text-hint">
                기기를 바꿔도 카카오 계정에
                <br />
                안전하게 보관돼요
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
