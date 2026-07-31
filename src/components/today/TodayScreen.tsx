"use client";

import { Check, Fire, X } from "@phosphor-icons/react/dist/ssr";
import { useState, useTransition } from "react";
import { itemMark } from "@/lib/gratitude";
import { saveEntry } from "@/lib/actions/entries";
import { uploadPhotoFile } from "@/lib/storage-client";
import { MoodFace, MOOD_PICKER_ORDER } from "./MoodFace";
import { PhotoSlider } from "@/components/ui/PhotoSlider";
import { Toast } from "@/components/ui/Toast";

type ExistingPhoto = { path: string; url: string };

export function TodayScreen({
  userId,
  todayKey,
  todayLabel,
  greeting,
  streak,
  initialEntry,
  memory,
}: {
  userId: string;
  todayKey: string;
  todayLabel: string;
  greeting: string;
  streak: number;
  initialEntry: { items: string[]; mood: number; photos: ExistingPhoto[] } | null;
  memory: { dateLabel: string; preview: string } | null;
}) {
  const [editing, setEditing] = useState(!initialEntry);
  const [draft, setDraft] = useState<string[]>(
    initialEntry ? [...initialEntry.items, "", "", ""].slice(0, 3) : ["", "", ""],
  );
  const [mood, setMood] = useState(initialEntry?.mood ?? 0);
  const [keptPhotos, setKeptPhotos] = useState<ExistingPhoto[]>(initialEntry?.photos ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filledCount = draft.filter((t) => t.trim()).length;
  const saveDisabled = filledCount === 0 || pending;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function onPhotoInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) setNewFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  function save() {
    startTransition(async () => {
      const uploaded = await Promise.all(
        newFiles.map((f) => uploadPhotoFile(f, userId, todayKey)),
      );
      const photos = [...keptPhotos.map((p) => p.path), ...uploaded];
      await saveEntry({ entryDate: todayKey, items: draft, mood, photos });
      setNewFiles([]);
      setEditing(false);
      showToast("오늘의 감사를 기록했어요");
    });
  }

  if (!editing && initialEntry) {
    return (
      <div className="animate-fade-up">
        <Header greeting={greeting} todayLabel={todayLabel} />
        <div className="mt-9 rounded-card border border-border bg-card p-7">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-accent">
              <MoodFace mood={initialEntry.mood} size={22} />
              오늘의 기록 완료
              <Check size={14} weight="bold" />
            </span>
            <span className="inline-flex items-center gap-1 text-[13px] text-faint">
              {streak}일 연속 기록 중
              <Fire size={14} weight="fill" color="var(--color-fire)" />
            </span>
          </div>
          <ol className="mt-4.5 flex list-none flex-col gap-3.5 p-0">
            {initialEntry.items.map((text, i) => (
              <li key={i} className="flex gap-3 text-[15.5px] leading-[1.6]">
                <span className="font-serif text-hint">{itemMark(i)}</span>
                <span>{text}</span>
              </li>
            ))}
          </ol>
          {keptPhotos.length > 0 && (
            <PhotoSlider srcs={keptPhotos.map((p) => p.url)} maxHeight={300} />
          )}
          <div className="mt-5.5 flex gap-2.5">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-btn border border-border-2 bg-card px-4 py-2.5 text-[13px] text-muted"
            >
              추가하기
            </button>
          </div>
        </div>
        <MemoryCard memory={memory} />
        <Toast message={toast} />
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <Header greeting={greeting} todayLabel={todayLabel} />
      <div className="mt-8 flex flex-col gap-3.5">
        <div className="flex items-center justify-center gap-1.5 rounded-card border border-border bg-card p-3">
          <span className="mr-2 text-[12.5px] text-faint">오늘 마음은</span>
          {MOOD_PICKER_ORDER.map((mi) => (
            <button
              key={mi}
              type="button"
              onClick={() => setMood(mi)}
              className="rounded-full border-0 p-1.5 leading-none"
              style={{ background: mood === mi ? "color-mix(in srgb, var(--color-accent) 18%, transparent)" : "transparent" }}
            >
              <MoodFace mood={mi} size={26} />
            </button>
          ))}
        </div>

        {draft.map((text, i) => (
          <div
            key={i}
            className="flex items-start gap-3.5 rounded-card border border-border bg-card px-4.5 py-1.5"
          >
            <span className="pt-4.5 font-serif text-[15px] text-hint">{itemMark(i)}</span>
            <textarea
              rows={2}
              value={text}
              placeholder={
                ["작은 것도 좋아요. 아침 커피 한 잔처럼.", "오늘 만난 사람 중 고마운 사람은?", "나 자신에게 고마웠던 순간."][i]
              }
              onChange={(e) => {
                const next = draft.slice();
                next[i] = e.target.value;
                setDraft(next);
              }}
              className="flex-1 resize-none border-0 bg-transparent py-4 text-[15.5px] leading-[1.6] text-ink outline-none"
            />
          </div>
        ))}

        {(keptPhotos.length > 0 || newFiles.length > 0) && (
          <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {keptPhotos.map((p) => (
              <div key={p.path} className="relative flex-none">
                {/* eslint-disable-next-line @next/next/no-img-element -- signed Supabase URL, not eligible for next/image optimization */}
                <img src={p.url} className="block h-24 w-24 rounded-[10px] object-cover" alt="" />
                <button
                  type="button"
                  onClick={() => setKeptPhotos((prev) => prev.filter((x) => x.path !== p.path))}
                  className="absolute right-1.5 top-1.5 flex h-5.5 w-5.5 items-center justify-center rounded-full border-0 bg-[rgba(55,50,44,.7)] text-white"
                >
                  <X size={11} weight="bold" />
                </button>
              </div>
            ))}
            {newFiles.map((f, i) => (
              <div key={i} className="relative flex-none">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob: preview URL, not eligible for next/image optimization */}
                <img
                  src={URL.createObjectURL(f)}
                  className="block h-24 w-24 rounded-[10px] object-cover"
                  alt=""
                />
                <button
                  type="button"
                  onClick={() => setNewFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute right-1.5 top-1.5 flex h-5.5 w-5.5 items-center justify-center rounded-full border-0 bg-[rgba(55,50,44,.7)] text-white"
                >
                  <X size={11} weight="bold" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-1 flex items-center justify-between">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-btn border border-dashed border-[#D5CFC2] px-3.5 py-2.5 text-[13px] text-faint">
            사진 첨부
            <input type="file" accept="image/*" multiple onChange={onPhotoInput} className="hidden" />
          </label>
          <button
            type="button"
            disabled={saveDisabled}
            onClick={save}
            className={
              saveDisabled
                ? "rounded-btn border-0 bg-[#EBE7DD] px-7 py-3 text-sm font-semibold text-hint"
                : "rounded-btn border-0 bg-ink px-7 py-3 text-sm font-semibold text-page"
            }
          >
            기록하기
          </button>
        </div>
      </div>
      <Toast message={toast} />
    </div>
  );
}

function Header({ greeting, todayLabel }: { greeting: string; todayLabel: string }) {
  return (
    <>
      <p className="m-0 text-[13px] tracking-[0.04em] text-faint">{todayLabel}</p>
      <h1 className="mt-2.5 font-serif text-[22px] font-normal leading-[1.45] text-ink">
        {greeting}
        <br />
        오늘의 감사 세 가지를 남겨보세요.
      </h1>
    </>
  );
}

function MemoryCard({ memory }: { memory: { dateLabel: string; preview: string } | null }) {
  if (!memory) return null;
  return (
    <div className="mt-11 border-t border-border pt-8">
      <p className="m-0 text-[12px] uppercase tracking-[0.08em] text-hint">이날을 기억하세요</p>
      <div className="mt-3.5 w-full rounded-card bg-panel px-6 py-5.5">
        <p className="m-0 font-serif text-[15px] text-muted">{memory.dateLabel}</p>
        <p className="mt-2.5 text-[15px] leading-[1.65] text-ink">&ldquo;{memory.preview}&rdquo;</p>
      </div>
    </div>
  );
}
