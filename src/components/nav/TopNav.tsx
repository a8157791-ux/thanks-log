"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/today", label: "오늘" },
  { href: "/archive", label: "기록" },
  { href: "/together", label: "함께" },
  { href: "/stats", label: "통계" },
  { href: "/settings", label: "설정" },
] as const;

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="flex items-baseline justify-between py-9 pb-7">
      <Link
        href="/today"
        className="font-serif text-[20px] font-bold tracking-heading text-ink"
      >
        땡큐로그
      </Link>
      <nav className="flex gap-[22px] text-sm">
        {TABS.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={
                active
                  ? "border-b-[1.5px] border-ink pb-1 font-semibold text-ink"
                  : "pb-1 text-[#9C958A] hover:text-ink"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
