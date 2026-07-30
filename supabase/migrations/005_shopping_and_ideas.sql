-- ============================================================
-- Migration: shopping_items (장 볼 재료) + menu_ideas (번뜩이는 메뉴 아이디어)
-- Run this once in the Supabase SQL editor.
-- ============================================================

create table public.shopping_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  done        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index shopping_items_user_idx on public.shopping_items (user_id, created_at);

create table public.menu_ideas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  note        text not null,
  created_at  timestamptz not null default now()
);
create index menu_ideas_user_idx on public.menu_ideas (user_id, created_at desc);

alter table public.shopping_items enable row level security;
alter table public.menu_ideas     enable row level security;

create policy shopping_items_all on public.shopping_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy menu_ideas_all on public.menu_ideas for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
