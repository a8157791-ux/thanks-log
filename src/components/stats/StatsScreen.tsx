"use client";

import Link from "next/link";
import { Flower, Image as ImageIcon } from "@phosphor-icons/react/dist/ssr";
import { GroupIcon } from "@/lib/group-icons";
import { GardenStageIcon } from "./GardenStageIcon";
import type { GroupSummary, MemberInfo } from "@/lib/group-data";
import type { GardenStage } from "@/lib/gratitude";

export type MemberShare = { name: string; color: string; count: number; pct: number };
export type GardenCell = { key: string; label: string; color: string | null };

export function StatsScreen({
  groups,
  activeGroup,
  stage,
  progressPct,
  nextLabel,
  togetherDays,
  gardenTotal,
  memberShare,
  gardenCells,
  topKeyword,
}: {
  groups: GroupSummary[];
  activeGroup: GroupSummary | null;
  members: MemberInfo[];
  stage: GardenStage;
  progressPct: number;
  nextLabel: string;
  togetherDays: number;
  gardenTotal: number;
  memberShare: MemberShare[];
  gardenCells: GardenCell[];
  topKeyword: { word: string; count: number } | null;
}) {
  if (!activeGroup) {
    return (
      <div className="animate-fade-up">
        <h2 className="m-0 font-serif text-[22px] font-normal text-ink">우리 마음 밭</h2>
        <p className="mt-8 py-10 text-center text-[13.5px] text-hint">
          그룹을 먼저 만들면 함께 키우는 마음 밭을 볼 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between">
        <h2 className="m-0 font-serif text-[22px] font-normal text-ink">우리 마음 밭</h2>
        <button
          type="button"
          onClick={() => alert("카드 저장 기능은 준비 중이에요")}
          className="inline-flex items-center gap-1.5 rounded-btn border border-border-2 bg-card px-3.5 py-2 text-[13px] font-semibold text-[#5F6E52]"
        >
          <ImageIcon size={15} />
          카드 저장
        </button>
      </div>

      <div className="no-scrollbar mt-4.5 flex gap-2 overflow-x-auto pb-1">
        {groups.map((g) => (
          <Link
            key={g.id}
            href={`/stats?g=${g.id}`}
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
      </div>

      <div
        className="relative mt-4.5 flex h-[220px] flex-col justify-end overflow-hidden rounded-panel p-5.5 text-white"
        style={{ background: `linear-gradient(160deg, ${stage.tint}, #EFEBE2)` }}
      >
        <span className="absolute right-6 top-5 opacity-90">
          <GardenStageIcon icon={stage.icon} size={52} />
        </span>
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(28,24,18,.78), rgba(28,24,18,.05) 55%)" }}
        />
        <div className="relative">
          <p className="m-0 font-serif text-[19px]">
            {activeGroup.name}의 밭 · {stage.name}
          </p>
          <p className="mt-1.5 text-[12.5px] opacity-90">
            함께 {togetherDays}일 · 감사 {gardenTotal}개를 심었어요
          </p>
          <div className="mt-3 h-[7px] overflow-hidden rounded-pill bg-white/30">
            <div className="h-full rounded-pill bg-white" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="mt-1.5 text-[11.5px] opacity-85">{nextLabel}</p>
        </div>
      </div>

      <div className="mt-3.5 rounded-panel border border-border bg-card px-6 py-5.5">
        <p className="m-0 mb-3.5 text-[12px] text-hint">멤버별 텃밭</p>
        <div className="flex h-3.5 overflow-hidden rounded-pill bg-panel-2">
          {memberShare.map((m) => (
            <div key={m.name} style={{ width: `${m.pct}%`, background: m.color }} title={m.name} />
          ))}
        </div>
        <div className="mt-3.5 flex flex-wrap gap-3.5">
          {memberShare.map((m) => (
            <span key={m.name} className="inline-flex items-center gap-1.5 text-[13px] text-muted">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
              {m.name} · {m.count}개
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3.5 rounded-panel border border-border bg-card px-6 py-5.5">
        <div className="flex items-center justify-between">
          <p className="m-0 text-[12px] text-hint">지난 5주의 밭</p>
          <p className="m-0 text-[11.5px] text-[#C9C2B3]">한 칸 = 하루</p>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {gardenCells.map((c) => (
            <div
              key={c.key}
              title={c.label}
              className="rounded-[6px]"
              style={{ aspectRatio: "1", background: c.color ?? "var(--color-panel-2)" }}
            />
          ))}
        </div>
      </div>

      {topKeyword && (
        <div className="mt-3.5 flex items-center gap-4 rounded-panel px-6 py-5.5" style={{ background: stage.tint }}>
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-[14px] bg-card">
            <Flower size={26} weight="fill" color="#B06E86" />
          </div>
          <div>
            <p className="m-0 text-[12px] text-faint">이 밭에 가장 크게 핀 꽃</p>
            <p className="mt-1.5 font-serif text-[20px] text-ink">&ldquo;{topKeyword.word}&rdquo;</p>
            <p className="mt-1 text-[12.5px] text-faint">{topKeyword.count}번 피어났어요</p>
          </div>
        </div>
      )}

      <p className="mt-6.5 text-center font-serif text-[15px] leading-[1.8] text-faint">
        &ldquo;감사는 반복될수록 선명해집니다.&rdquo;
      </p>
    </div>
  );
}
