-- ============================================================
-- Migration: fridge_items에 실온보관 / 양념·소스 구역 추가
-- Run this once in the Supabase SQL editor (already applied
-- 002_fridge_items.sql before this one).
-- ============================================================

alter table public.fridge_items drop constraint if exists fridge_items_zone_check;

alter table public.fridge_items
  add constraint fridge_items_zone_check
  check (zone in ('freezer', 'fridge', 'kimchi', 'room', 'seasoning'));
