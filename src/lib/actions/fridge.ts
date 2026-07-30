"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FridgeZone } from "@/lib/types";

export async function addFridgeItem(zone: FridgeZone, name: string, groupId: string | null = null) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("fridge_items").insert({
    user_id: user.id,
    group_id: groupId,
    zone,
    name: trimmed,
  });

  revalidatePath("/fridge");
}

export async function removeFridgeItem(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // RLS (fridge_items_delete) allows the owner or any fellow group member of a shared item.
  await supabase.from("fridge_items").delete().eq("id", id);

  revalidatePath("/fridge");
}

export async function moveFridgeItem(id: string, zone: FridgeZone) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // RLS (fridge_items_update) allows the owner or any fellow group member of a shared item.
  await supabase.from("fridge_items").update({ zone }).eq("id", id);

  revalidatePath("/fridge");
}
