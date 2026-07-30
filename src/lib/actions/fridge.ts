"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FridgeZone } from "@/lib/types";

export async function addFridgeItem(
  zone: FridgeZone,
  name: string,
  groupId: string | null = null,
): Promise<{ error: string | null }> {
  const trimmed = name.trim();
  if (!trimmed) return { error: null };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase.from("fridge_items").insert({
    user_id: user.id,
    group_id: groupId,
    zone,
    name: trimmed,
  });

  revalidatePath("/fridge");
  return { error: error?.message ?? null };
}

export async function removeFridgeItem(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // RLS (fridge_items_delete) allows the owner or any fellow group member of a shared item.
  const { error } = await supabase.from("fridge_items").delete().eq("id", id);

  revalidatePath("/fridge");
  return { error: error?.message ?? null };
}

export async function moveFridgeItem(id: string, zone: FridgeZone): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // RLS (fridge_items_update) allows the owner or any fellow group member of a shared item.
  const { error } = await supabase.from("fridge_items").update({ zone }).eq("id", id);

  revalidatePath("/fridge");
  return { error: error?.message ?? null };
}
