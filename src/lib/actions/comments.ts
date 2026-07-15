"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addComment(entryId: string, body: string | null, sticker: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const trimmedBody = body?.trim() || null;
  if (!trimmedBody && !sticker) return;

  await supabase
    .from("comments")
    .insert({ entry_id: entryId, user_id: user.id, body: trimmedBody, sticker });

  revalidatePath("/together");
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("comments").delete().eq("id", commentId).eq("user_id", user.id);
  revalidatePath("/together");
}
