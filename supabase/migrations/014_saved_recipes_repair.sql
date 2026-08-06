-- ============================================================
-- Repair: saved_recipes (오늘의 메뉴 추천 → 저장) 저장이 안 될 때
-- 테이블/유니크 제약/RLS 정책이 빠져 있으면 채워 넣는다. 이미 있으면 아무 것도 안 함.
-- Run this once in the Supabase SQL editor.
-- ============================================================

create table if not exists public.saved_recipes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  minutes     integer not null default 0,
  matched     text[] not null default '{}',
  missing     text[] not null default '{}',
  link        text not null,
  created_at  timestamptz not null default now()
);

-- upsert(onConflict "user_id,name")에 필요한 유니크 제약 — 없으면 추가, 이미 있으면 무시
do $$
begin
  alter table public.saved_recipes
    add constraint saved_recipes_user_id_name_key unique (user_id, name);
exception
  when duplicate_table then null; -- 같은 이름의 제약이 이미 있음
  when duplicate_object then null; -- 동일한 유니크 제약이 이미 있음
end $$;

create index if not exists saved_recipes_user_idx on public.saved_recipes (user_id, created_at desc);

alter table public.saved_recipes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'saved_recipes' and policyname = 'saved_recipes_all'
  ) then
    create policy saved_recipes_all on public.saved_recipes for all
      using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;
