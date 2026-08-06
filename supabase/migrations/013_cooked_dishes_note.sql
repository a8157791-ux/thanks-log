-- ============================================================
-- Migration: cooked_dishes.note (양념장·간단 레시피 메모)
-- 해먹은 메뉴에 간단한 레시피/양념장 메모를 함께 적을 수 있게.
-- Run this once in the Supabase SQL editor.
-- ============================================================

alter table public.cooked_dishes add column if not exists note text;
