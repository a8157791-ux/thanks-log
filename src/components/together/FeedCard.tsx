"use client";

import { useState, useTransition } from "react";
import { ChatCircle, Heart, Leaf, Sticker } from "@phosphor-icons/react/dist/ssr";
import { itemMark } from "@/lib/gratitude";
import { PhotoSlider } from "@/components/ui/PhotoSlider";
import { StickerByName } from "@/components/ui/StickerImage";
import { StickerPicker } from "./StickerPicker";
import { toggleHeart } from "@/lib/actions/hearts";
import { addComment, deleteComment } from "@/lib/actions/comments";
import type { FeedEntry } from "./TogetherScreen";

export function FeedCard({ entry }: { entry: FeedEntry }) {
  const [heartedByMe, setHeartedByMe] = useState(entry.heartedByMe);
  const [heartCount, setHeartCount] = useState(entry.heartCount);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [stickerPickerOpen, setStickerPickerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  function onToggleHeart() {
    setHeartedByMe((v) => !v);
    setHeartCount((c) => (heartedByMe ? c - 1 : c + 1));
    startTransition(() => toggleHeart(entry.entryId));
  }

  function submitComment() {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    startTransition(() => addComment(entry.entryId, body, null));
  }

  function pickSticker(full: string) {
    setStickerPickerOpen(false);
    setFavorites((prev) => [full, ...prev.filter((f) => f !== full)].slice(0, 6));
    startTransition(() => addComment(entry.entryId, null, full));
  }

  return (
    <div className="rounded-card border border-l-[3px] bg-card p-5.5" style={{ borderLeftColor: entry.authorColor }}>
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold text-white"
          style={{ background: entry.authorColor }}
        >
          {entry.authorName.slice(0, 1)}
        </span>
        <span className="text-[13.5px] font-semibold text-ink">{entry.authorName}</span>
        <span className="ml-auto font-serif text-[12px] text-hint">{entry.dateLabel}</span>
      </div>

      {entry.photoUrls.length > 0 && <PhotoSlider srcs={entry.photoUrls} maxHeight={260} />}

      <ol className="mt-3.5 flex list-none flex-col gap-2.5 p-0">
        {entry.items.map((text, i) => (
          <li key={i} className="flex gap-2.5 text-[14.5px] leading-[1.6]">
            <span className="font-serif text-hint">{itemMark(i)}</span>
            <span>{text}</span>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex items-center gap-2 border-t border-divider pt-3.5">
        <button
          type="button"
          onClick={onToggleHeart}
          className="inline-flex items-center gap-1.5 border-0 bg-transparent"
        >
          <Heart
            size={18}
            weight={heartedByMe ? "fill" : "regular"}
            color={heartedByMe ? "var(--color-heart)" : "var(--color-hint)"}
          />
          <span className="text-[13px] text-muted">{heartCount}</span>
        </button>
        <button
          type="button"
          onClick={() => setCommentsOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 border-0 bg-transparent"
        >
          <ChatCircle size={17} color="var(--color-hint)" />
          <span className="text-[13px] text-muted">{entry.comments.length}</span>
        </button>
      </div>

      {commentsOpen && (
        <div className="mt-3.5 flex animate-fade-up flex-col gap-3.5 border-t border-[#F5F1E9] pt-3.5">
          {entry.comments.length === 0 && (
            <p className="m-0 inline-flex w-full items-center justify-center gap-1 py-1.5 text-center text-[13px] text-hint">
              첫 댓글을 남겨보세요
              <Leaf size={13} />
            </p>
          )}
          {entry.comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <span
                className="flex h-6.5 w-6.5 flex-none items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: c.authorColor }}
              >
                {c.authorName.slice(0, 1)}
              </span>
              <div className="flex-1">
                <p className="m-0 text-[12.5px] font-semibold text-ink">{c.authorName}</p>
                {c.body && <p className="mt-0.5 text-sm leading-[1.5] text-[#4A443C]">{c.body}</p>}
                {c.sticker && (
                  <div className="mt-1">
                    <StickerByName full={c.sticker} size={54} />
                  </div>
                )}
              </div>
              {c.mine && (
                <button
                  type="button"
                  onClick={() => startTransition(() => deleteComment(c.id))}
                  className="flex-none border-0 bg-transparent px-1 text-[12px] text-[#C9B7A8]"
                >
                  삭제
                </button>
              )}
            </div>
          ))}

          {stickerPickerOpen && <StickerPicker favorites={favorites} onPick={pickSticker} />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStickerPickerOpen((v) => !v)}
              className="flex-none rounded-full border-0 bg-transparent p-1 text-muted"
            >
              <Sticker size={19} />
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder="따뜻한 한마디를 남겨요"
              className="flex-1 rounded-pill border border-border-2 bg-page px-4 py-2.5 text-sm outline-none"
            />
            <button
              type="button"
              onClick={submitComment}
              className="flex-none whitespace-nowrap rounded-pill border-0 bg-ink px-5.5 py-2.5 text-sm font-semibold text-page"
            >
              등록
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
