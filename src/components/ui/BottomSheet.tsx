"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";

// Screen components wrap their content in an `.animate-fade-up` div, and any
// ancestor with a CSS animation/transform on it becomes the containing block
// for `position: fixed` descendants in most mobile browsers — so a modal
// rendered inline ends up pinned to that ancestor's (tall, scrollable) box
// instead of the actual viewport. A portal to <body> sidesteps that
// entirely, regardless of what's animating up the tree.
//
// No mount-detection dance needed here: `open` only ever flips true from a
// client-side event handler (never on the initial/SSR render), so by the
// time we'd try to portal, `document` is already guaranteed to exist.

export function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[rgba(55,50,44,.35)] animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[640px] box-border rounded-t-sheet bg-page px-6 pt-7 pb-9 animate-fade-up"
      >
        <div className="mx-auto mb-5 h-[4px] w-[38px] rounded-pill bg-[#DDD7CB]" />
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function CenterModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(55,50,44,.35)] p-6 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] max-h-[80vh] overflow-auto box-border rounded-panel bg-page p-8 animate-fade-up"
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
