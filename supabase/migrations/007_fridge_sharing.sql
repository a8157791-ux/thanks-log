-- ============================================================
-- Migration: 냉장고 공유 (기존 '함께' 그룹으로 냉장고를 같이 쓰기)
-- Run this once in the Supabase SQL editor.
-- ============================================================

alter table public.fridge_items
  add column group_id uuid references public.groups(id) on delete cascade;

create index fridge_items_group_idx on public.fridge_items (group_id, zone, created_at);

drop policy if exists fridge_items_all on public.fridge_items;

-- personal items: only the owner. shared items: any member of the linked group.
create policy fridge_items_select on public.fridge_items for select
  using (user_id = auth.uid() or (group_id is not null and public.is_group_member(group_id)));

create policy fridge_items_insert on public.fridge_items for insert
  with check (user_id = auth.uid() and (group_id is null or public.is_group_member(group_id)));

create policy fridge_items_update on public.fridge_items for update
  using (user_id = auth.uid() or (group_id is not null and public.is_group_member(group_id)));

create policy fridge_items_delete on public.fridge_items for delete
  using (user_id = auth.uid() or (group_id is not null and public.is_group_member(group_id)));
