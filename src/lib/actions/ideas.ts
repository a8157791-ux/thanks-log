"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addMenuIdea(note: string): Promise<{ error: string | null }> {
  const trimmed = note.trim();
  if (!trimmed) return { error: null };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase.from("menu_ideas").insert({ user_id: user.id, note: trimmed });

  revalidatePath("/fridge");
  return { error: error?.message ?? null };
}

export async function removeMenuIdea(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase.from("menu_ideas").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/fridge");
  return { error: error?.message ?? null };
}
