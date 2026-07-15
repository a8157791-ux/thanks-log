"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function toggleHeart(entryId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: existing } = await supabase
    .from("hearts")
    .select("entry_id")
    .eq("entry_id", entryId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("hearts").delete().eq("entry_id", entryId).eq("user_id", user.id);
  } else {
    await supabase.from("hearts").insert({ entry_id: entryId, user_id: user.id });
  }

  revalidatePath("/together");
}
