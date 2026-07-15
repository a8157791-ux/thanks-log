"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addFriend(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("friends").insert({ user_id: user.id, friend_name: trimmed });
  revalidatePath("/settings");
  revalidatePath("/together");
}

export async function removeFriend(friendName: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase
    .from("friends")
    .delete()
    .eq("user_id", user.id)
    .eq("friend_name", friendName);
  revalidatePath("/settings");
  revalidatePath("/together");
}
