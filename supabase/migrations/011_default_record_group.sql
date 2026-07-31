-- ============================================================
-- Migration: default_record_group_id (기록 화면의 "기본으로 열림")
-- 냉장고에 이미 있던 default_fridge_group_id와 같은 패턴 — 기록 탭을 열 때
-- 항상 특정 그룹부터 보여주고 싶을 때 쓴다. null = 내 기록(개인).
-- Run this once in the Supabase SQL editor.
-- ============================================================

alter table public.profiles
  add column default_record_group_id uuid references public.groups(id) on delete set null;
