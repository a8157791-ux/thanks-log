"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CookedDish } from "@/lib/types";

const COOKED_COLUMNS = "id, user_id, name, link, note, cooked_on, created_at";

export async function addCookedDish(dish: {
  name: string;
  link?: string | null;
  note?: string | null;
  cookedOn?: string | null;
}): Promise<{ data: CookedDish | null; error: string | null }> {
  const name = dish.name.trim();
  if (!name) return { data: null, error: null };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const link = dish.link?.trim() || null;
  const note = dish.note?.trim() || null;
  const cooked_on = dish.cookedOn?.trim() || undefined; // fall back to DB default (오늘)

  const { data, error } = await supabase
    .from("cooked_dishes")
    .insert({ user_id: user.id, name, link, note, ...(cooked_on ? { cooked_on } : {}) })
    .select(COOKED_COLUMNS)
    .single();

  revalidatePath("/fridge/cookbook");
  return { data: data ?? null, error: error?.message ?? null };
}

// 링크/메모를 부분 업데이트. 넘어온 필드만 바꾼다.
export async function updateCookedDish(
  id: string,
  patch: { link?: string | null; note?: string | null },
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const fields: { link?: string | null; note?: string | null } = {};
  if ("link" in patch) fields.link = patch.link?.trim() || null;
  if ("note" in patch) fields.note = patch.note?.trim() || null;
  if (Object.keys(fields).length === 0) return { error: null };

  const { error } = await supabase
    .from("cooked_dishes")
    .update(fields)
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/fridge/cookbook");
  return { error: error?.message ?? null };
}

export async function removeCookedDish(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase.from("cooked_dishes").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/fridge/cookbook");
  return { error: error?.message ?? null };
}
