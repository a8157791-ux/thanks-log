import { Check, Eye, Heart, ChatCircle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { MoodFace } from "@/components/today/MoodFace";
import { KakaoLoginButton } from "@/components/auth/KakaoLoginButton";
import { demoEntries } from "@/lib/demo-data";
import { dateLabel, itemMark } from "@/lib/gratitude";

export function DemoScreen() {
  const entries = demoEntries();
  const [todayEntry, ...past] = entries;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col px-6">
      <header className="flex items-baseline justify-between py-9 pb-7">
        <Link href="/" className="font-serif text-[20px] font-bold tracking-heading text-ink">
          땡큐로그
        </Link>
        <Link href="/" className="text-sm text-[#9C958A] hover:text-ink">
          나가기
        </Link>
      </header>

      <main className="flex-1 pb-16">
        <div className="animate-fade-up">
          <p className="inline-flex items-center gap-1.5 rounded-pill bg-panel-2 px-3.5 py-2 text-[12.5px] font-semibold text-[#5F6E52]">
            <Eye size={15} weight="fill" />
            예시로 둘러보는 중이에요
          </p>
          <h1 className="mt-4 font-serif text-[26px] font-normal leading-[1.45] text-ink">
            이런 하루가 쌓여요.
            <br />
            직접 써보려면 로그인하세요.
          </h1>

          <div className="mt-8 rounded-card border border-border bg-card p-7">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-accent">
                <MoodFace mood={todayEntry.mood} size={22} />
                오늘의 기록 완료
                <Check size={14} weight="bold" />
              </span>
              <span className="text-[13px] text-faint">{dateLabel(todayEntry.key, true)}</span>
            </div>
            <ol className="mt-4.5 flex list-none flex-col gap-3.5 p-0">
              {todayEntry.items.map((text, i) => (
                <li key={i} className="flex gap-3 text-[15.5px] leading-[1.6]">
                  <span className="font-serif text-hint">{itemMark(i)}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4.5 flex items-center gap-4 border-t border-divider pt-3.5 text-[13px] text-hint">
              <span className="inline-flex items-center gap-1">
                <Heart size={15} weight="fill" color="var(--color-heart)" />4
              </span>
              <span className="inline-flex items-center gap-1">
                <ChatCircle size={15} />2
              </span>
            </div>
          </div>

          <p className="mt-11 text-[12px] uppercase tracking-[0.08em] text-hint">지난 기록</p>
          <div className="mt-3.5 flex flex-col gap-3">
            {past.map((entry) => (
              <div key={entry.key} className="rounded-card bg-panel px-6 py-5">
                <div className="flex items-center gap-2">
                  <MoodFace mood={entry.mood} size={18} />
                  <p className="m-0 font-serif text-[14px] text-muted">
                    {dateLabel(entry.key, true)}
                  </p>
                </div>
                <ol className="mt-3 flex list-none flex-col gap-2 p-0">
                  {entry.items.map((text, i) => (
                    <li key={i} className="flex gap-2.5 text-[14.5px] leading-[1.55] text-ink">
                      <span className="font-serif text-hint">{itemMark(i)}</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-panel bg-ink px-7 py-10 text-center text-page">
            <h2 className="m-0 font-serif text-[22px] font-normal leading-[1.45]">
              마음에 드시나요?
              <br />
              오늘의 감사를 직접 남겨보세요.
            </h2>
            <p className="mt-3.5 text-[13.5px] text-[#C7C0B4]">
              여기 기록들은 예시예요. 로그인하면 나만의 일기가 시작돼요.
            </p>
            <div className="mt-7 flex justify-center">
              <KakaoLoginButton />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
