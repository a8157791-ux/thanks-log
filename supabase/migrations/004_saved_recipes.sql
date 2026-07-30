-- ============================================================
-- Migration: saved_recipes (오늘의 메뉴 추천 → 저장하기)
-- Run this once in the Supabase SQL editor.
-- ============================================================

create table public.saved_recipes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  minutes     integer not null default 0,
  matched     text[] not null default '{}',
  missing     text[] not null default '{}',
  link        text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, name)
);
create index saved_recipes_user_idx on public.saved_recipes (user_id, created_at desc);

alter table public.saved_recipes enable row level security;

create policy saved_recipes_all on public.saved_recipes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
