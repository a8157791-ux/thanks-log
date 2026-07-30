"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addScheduleEvent(
  title: string,
  eventDate: string,
  groupId: string | null = null,
): Promise<{ error: string | null }> {
  const trimmed = title.trim();
  if (!trimmed || !eventDate) return { error: null };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { error } = await supabase.from("schedule_items").insert({
    user_id: user.id,
    group_id: groupId,
    title: trimmed,
    event_date: eventDate,
  });

  revalidatePath("/archive");
  return { error: error?.message ?? null };
}

export async function removeScheduleEvent(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // RLS (schedule_items_delete) allows the owner or any fellow group member of a shared event.
  const { error } = await supabase.from("schedule_items").delete().eq("id", id);

  revalidatePath("/archive");
  return { error: error?.message ?? null };
}
