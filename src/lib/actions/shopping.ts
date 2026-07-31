"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addShoppingItem(name: string): Promise<{ error: string | null }> {
  const trimmed = name.trim();
  if (!trimmed) return { error: null };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase.from("shopping_items").insert({ user_id: user.id, name: trimmed });

  revalidatePath("/fridge");
  return { error: error?.message ?? null };
}

export async function toggleShoppingItem(id: string, done: boolean): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase
    .from("shopping_items")
    .update({ done })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/fridge");
  return { error: error?.message ?? null };
}

export async function removeShoppingItem(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase.from("shopping_items").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/fridge");
  return { error: error?.message ?? null };
}
