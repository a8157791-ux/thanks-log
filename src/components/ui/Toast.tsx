"use client";

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-8 left-1/2 z-[200] -translate-x-1/2 whitespace-nowrap rounded-pill bg-ink px-[22px] py-[12px] text-[13.5px] text-page animate-fade-up">
      {message}
    </div>
  );
}
