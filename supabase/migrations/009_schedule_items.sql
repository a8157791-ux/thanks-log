-- ============================================================
-- Migration: schedule_items (기록 페이지의 공유 일정)
-- 개인용(그룹 없음) 또는 특정 그룹 전용(group_id) — fridge_items와
-- 동일한 공유 모델. 그룹이 다르면 서로의 일정이 보이지 않는다.
-- Run this once in the Supabase SQL editor.
-- ============================================================

create table public.schedule_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  group_id    uuid references public.groups(id) on delete cascade, -- null = 개인 일정
  title       text not null,
  event_date  date not null,
  created_at  timestamptz not null default now()
);
create index schedule_items_user_idx on public.schedule_items (user_id, event_date);
create index schedule_items_group_idx on public.schedule_items (group_id, event_date);

alter table public.schedule_items enable row level security;

create policy schedule_items_select on public.schedule_items for select
  using (user_id = auth.uid() or (group_id is not null and public.is_group_member(group_id)));

create policy schedule_items_insert on public.schedule_items for insert
  with check (user_id = auth.uid() and (group_id is null or public.is_group_member(group_id)));

create policy schedule_items_update on public.schedule_items for update
  using (user_id = auth.uid() or (group_id is not null and public.is_group_member(group_id)));

create policy schedule_items_delete on public.schedule_items for delete
  using (user_id = auth.uid() or (group_id is not null and public.is_group_member(group_id)));
