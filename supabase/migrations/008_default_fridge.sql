-- ============================================================
-- Migration: 기본 냉장고 선택 (내 냉장고 / 특정 그룹의 공유 냉장고)
-- Run this once in the Supabase SQL editor.
-- ============================================================

alter table public.profiles
  add column default_fridge_group_id uuid references public.groups(id) on delete set null;
