-- ============================================================
-- Migration: fridge_items (냉장고 재료 → 메뉴 추천 기능)
-- Run this once in the Supabase SQL editor for the existing project.
-- (Already folded into supabase/schema.sql for future fresh installs.)
-- ============================================================

create table public.fridge_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  zone        text not null check (zone in ('freezer', 'fridge', 'kimchi', 'room', 'seasoning')),
  name        text not null,
  created_at  timestamptz not null default now()
);
create index fridge_items_user_idx on public.fridge_items (user_id, zone, created_at);

alter table public.fridge_items enable row level security;

create policy fridge_items_all on public.fridge_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
