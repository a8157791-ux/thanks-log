"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addShoppingItem(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("shopping_items").insert({ user_id: user.id, name: trimmed });

  revalidatePath("/fridge");
}

export async function toggleShoppingItem(id: string, done: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("shopping_items").update({ done }).eq("id", id).eq("user_id", user.id);

  revalidatePath("/fridge");
}

export async function removeShoppingItem(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("shopping_items").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/fridge");
}
