"use client";

import type { ReactNode } from "react";

export function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
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
    </div>
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
  if (!open) return null;
  return (
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
    </div>
  );
}
