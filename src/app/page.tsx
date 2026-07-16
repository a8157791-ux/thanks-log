import {
  ArrowRight,
  ChatCircle,
  ChatCircleDots,
  ClockAfternoon,
  Hand,
  Heart,
  Images,
  Leaf,
  Notepad,
  Plant,
  Sticker,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { KakaoLoginButton } from "@/components/auth/KakaoLoginButton";

const FEATURES = [
  { Icon: Notepad, tint: "#EEF1E9", ink: "#5F6E52", title: "하루 세 가지", body: "부담 없이 딱 세 줄. 작은 것부터 적다 보면 마음이 가벼워져요." },
  { Icon: Images, tint: "#F3ECEF", ink: "#B06E86", title: "사진과 함께", body: "그날의 장면을 여러 장 담고, 옆으로 넘겨보며 추억해요." },
  { Icon: UsersThree, tint: "#EAF0F3", ink: "#5C87A6", title: "함께 쓰는 그룹", body: "가족·친구와 감사를 나누고 하트와 스티커로 반응해요." },
  { Icon: Plant, tint: "#E9F0E3", ink: "#5F8A55", title: "마음 밭 성장", body: "감사가 쌓일수록 우리 그룹의 밭이 씨앗에서 나무로 자라요." },
  { Icon: Sticker, tint: "#F5EEE6", ink: "#B0713F", title: "손그림 스티커", body: "귀여운 손그림 스티커로 댓글을 더 다정하게." },
  { Icon: ClockAfternoon, tint: "#F0EDE5", ink: "#8A7B5F", title: "이날을 기억해요", body: "지난 감사를 랜덤으로 다시 만나며 그때의 마음을 떠올려요." },
];

const STEPS = [
  { n: "01", title: "카카오로 로그인", body: "3초면 시작. 닉네임은 자유롭게 바꿀 수 있어요." },
  { n: "02", title: "오늘의 감사 세 줄", body: "고마웠던 순간 셋과 사진 몇 장을 남겨요." },
  { n: "03", title: "친구와 나누기", body: "그룹에 초대해 서로의 하루에 다정하게 반응해요." },
];

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <header className="mx-auto flex max-w-[1080px] items-center justify-between px-7 py-6.5">
        <div className="font-serif text-[21px] font-bold tracking-heading text-ink">
          땡큐로그
        </div>
        <nav className="flex items-center gap-6.5 text-sm">
          <Link href="#features" className="text-muted hover:text-ink">기능</Link>
          <Link href="#how" className="text-muted hover:text-ink">사용법</Link>
          <Link href="#together" className="text-muted hover:text-ink">함께</Link>
          <KakaoLoginButton className="inline-flex items-center gap-1.5 rounded-[9px] bg-kakao px-4 py-2.5 font-bold text-kakao-ink" />
        </nav>
      </header>

      <section className="mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-10 px-7 pb-10 pt-14 md:grid-cols-[1.05fr_0.95fr]">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-panel-2 px-4 py-2 text-[13px] font-semibold text-[#5F6E52]">
            <Leaf size={15} weight="fill" />
            하루 3분, 마음이 자라는 습관
          </span>
          <h1 className="mt-5.5 font-serif text-[36px] font-normal leading-[1.32] tracking-heading text-ink md:text-[46px]">
            오늘 고마웠던
            <br />
            세 가지를 남겨요.
          </h1>
          <p className="mt-5 max-w-[440px] text-[16.5px] leading-[1.75] text-muted">
            작은 감사를 기록하고, 사랑하는 사람들과 나눠요. 사진과 스티커로 다정하게, 함께 쓰는 감사일기.
          </p>
          <div className="mt-8.5 flex flex-wrap gap-3">
            <KakaoLoginButton />
            <Link
              href="#features"
              className="inline-flex items-center gap-2 rounded-[12px] border border-border-2 bg-card px-6 py-[15px] text-[15.5px] font-semibold text-[#4A443C]"
            >
              둘러보기
              <ArrowRight size={16} />
            </Link>
          </div>
          <p className="mt-4 text-[13px] text-hint-2">
            기기를 바꿔도 카카오 계정에 안전하게 보관돼요
          </p>
        </div>

        <div className="relative h-[400px] animate-fade-up md:h-[440px]">
          <div className="absolute left-[12%] right-[12%] top-5 rounded-panel border border-border bg-card p-6.5 shadow-hero">
            <p className="text-[12px] text-hint-2">2026년 7월 15일 수요일</p>
            <ol className="mt-4 flex list-none flex-col gap-3.5 p-0">
              <li className="flex gap-2.5 text-[14.5px] leading-[1.5]">
                <span className="font-serif text-hint">一</span>
                <span>아침 햇살에 눈뜬 조용한 순간</span>
              </li>
              <li className="flex gap-2.5 text-[14.5px] leading-[1.5]">
                <span className="font-serif text-hint">二</span>
                <span>친구가 보내준 다정한 메시지</span>
              </li>
              <li className="flex gap-2.5 text-[14.5px] leading-[1.5]">
                <span className="font-serif text-hint">三</span>
                <span>퇴근길 노을이 유난히 예뻤음</span>
              </li>
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
          <Image
            src="/stickers/placeholder/party.png"
            alt=""
            width={90}
            height={90}
            className="absolute right-[2%] top-0 animate-floaty"
            style={{ "--r": "8deg" } as React.CSSProperties}
          />
          <Image
            src="/stickers/placeholder/hi.png"
            alt=""
            width={86}
            height={86}
            className="absolute bottom-6 left-[2%] animate-floaty"
            style={{ "--r": "-9deg", animationDelay: ".6s" } as React.CSSProperties}
          />
          <Image
            src="/stickers/placeholder/thanks.png"
            alt=""
            width={72}
            height={72}
            className="absolute bottom-0 right-[14%] animate-floaty"
            style={{ "--r": "6deg", animationDelay: ".3s" } as React.CSSProperties}
          />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-[1080px] px-7 py-[70px]">
        <p className="text-center text-[13px] uppercase tracking-[0.08em] text-hint-2">
          Features
        </p>
        <h2 className="mt-3 text-center font-serif text-[32px] font-normal text-ink">
          감사를 오래 이어가는 이유
        </h2>
        <div className="mt-11 grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-panel border border-border bg-card px-6 py-7">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-[14px]"
                style={{ background: f.tint, color: f.ink }}
              >
                <f.Icon size={24} />
              </span>
              <h3 className="mt-5 font-serif text-[19px] font-normal text-ink">{f.title}</h3>
              <p className="mt-2 text-[14.5px] leading-[1.65] text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="bg-panel-2 py-19">
        <div className="mx-auto max-w-[1080px] px-7">
          <p className="text-center text-[13px] uppercase tracking-[0.08em] text-hint-2">
            How it works
          </p>
          <h2 className="mt-3 text-center font-serif text-[32px] font-normal text-ink">
            이렇게 시작해요
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-5.5 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <p className="font-serif text-[40px] text-[#C9C2B3]">{s.n}</p>
                <h3 className="mt-2 font-serif text-[20px] font-normal text-ink">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-[260px] text-[14.5px] leading-[1.65] text-muted">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="together"
        className="mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-11 px-7 py-20 md:grid-cols-[0.95fr_1.05fr]"
      >
        <div className="relative h-[300px] overflow-hidden rounded-panel bg-gradient-to-b from-[#E9F0E3] to-[#F7F4ED] md:h-[340px]">
          <Image
            src="/stickers/placeholder/thumbsup.png"
            alt=""
            width={100}
            height={100}
            className="absolute left-8 top-9 animate-floaty"
            style={{ "--r": "-6deg" } as React.CSSProperties}
          />
          <Image
            src="/stickers/placeholder/laugh.png"
            alt=""
            width={100}
            height={100}
            className="absolute bottom-8 right-10 animate-floaty"
            style={{ "--r": "7deg", animationDelay: ".5s" } as React.CSSProperties}
          />
          <Image
            src="/stickers/placeholder/heart-eyes.png"
            alt=""
            width={72}
            height={72}
            className="absolute right-12 top-[110px] animate-floaty"
            style={{ "--r": "4deg", animationDelay: ".2s" } as React.CSSProperties}
          />
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-panel-2 px-4 py-2 text-[13px] font-semibold text-[#5F6E52]">
            <UsersThree size={15} weight="fill" />
            함께 쓰는 감사
          </span>
          <h2 className="mt-4.5 font-serif text-[28px] font-normal leading-[1.35] text-ink md:text-[34px]">
            부부, 가족, 친구와
            <br />
            마음을 나눠요
          </h2>
          <p className="mt-4.5 max-w-[420px] text-[16px] leading-[1.75] text-muted">
            그룹을 만들어 서로의 감사일기를 하나의 타임라인에서 보고, 하트와 손그림 스티커로
            다정하게 반응해요. 그룹이 감사를 쌓을수록 &lsquo;우리 마음 밭&rsquo;이 무럭무럭 자라요.
          </p>
          <div className="mt-6.5 flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-card px-4 py-2.5 text-[13.5px] text-[#4A443C]">
              <Heart size={14} weight="fill" color="var(--color-heart)" />
              커플 · 가족 그룹
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-card px-4 py-2.5 text-[13.5px] text-[#4A443C]">
              <Plant size={14} weight="fill" color="var(--color-accent)" />
              마음 밭 성장
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-card px-4 py-2.5 text-[13.5px] text-[#4A443C]">
              <Hand size={14} weight="fill" color="#B0713F" />
              손그림 스티커
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[760px] px-7 pb-[100px] pt-5 text-center">
        <div className="rounded-panel bg-ink px-8 py-14 text-page">
          <div className="mb-5.5 flex justify-center gap-2.5">
            <Image src="/stickers/placeholder/party.png" alt="" width={56} height={56} />
            <Image src="/stickers/placeholder/heart-eyes.png" alt="" width={56} height={56} className="rounded-[12px] bg-page" />
            <Image src="/stickers/placeholder/thanks.png" alt="" width={56} height={56} />
          </div>
          <h2 className="font-serif text-[30px] font-normal leading-[1.4]">
            오늘의 감사,
            <br />
            지금 시작해볼까요?
          </h2>
          <p className="mt-4 text-[15px] text-[#C7C0B4]">매일 밤 3분이면 충분해요.</p>
          <div className="mt-7.5 flex justify-center">
            <KakaoLoginButton className="inline-flex items-center gap-2.5 rounded-[13px] bg-kakao px-8 py-4 text-[16px] font-bold text-kakao-ink" />
          </div>
        </div>
        <p className="mt-8.5 inline-flex items-center gap-1 text-[13px] text-hint-2">
          <ChatCircleDots size={14} />© 2026 땡큐로그 · 친구와 함께 쓰는 감사 습관
        </p>
      </section>
    </div>
  );
}
