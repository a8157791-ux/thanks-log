-- ============================================================
-- Migration: cooked_dishes (해먹은 메뉴 기록 · 요리 창고)
-- 그날 실제로 해먹은 메뉴를 레시피 링크와 함께 날짜별로 저장.
-- Run this once in the Supabase SQL editor.
-- ============================================================

create table public.cooked_dishes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  link        text,
  cooked_on   date not null default current_date,
  created_at  timestamptz not null default now()
);
create index cooked_dishes_user_idx on public.cooked_dishes (user_id, cooked_on desc, created_at desc);

alter table public.cooked_dishes enable row level security;

create policy cooked_dishes_all on public.cooked_dishes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
