"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addMenuIdea(note: string) {
  const trimmed = note.trim();
  if (!trimmed) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("menu_ideas").insert({ user_id: user.id, note: trimmed });

  revalidatePath("/fridge");
}

export async function removeMenuIdea(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("menu_ideas").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/fridge");
}
