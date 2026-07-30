-- ============================================================
-- Migration: passed_recipes (오늘의 메뉴 추천 → 패스하기, 새로고침해도 유지)
-- Run this once in the Supabase SQL editor.
-- ============================================================

create table public.passed_recipes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, name)
);
create index passed_recipes_user_idx on public.passed_recipes (user_id, created_at desc);

alter table public.passed_recipes enable row level security;

create policy passed_recipes_all on public.passed_recipes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
