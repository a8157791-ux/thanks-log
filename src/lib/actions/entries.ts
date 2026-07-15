"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveEntry(params: {
  entryDate: string;
  items: string[];
  mood: number;
  photos: string[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const items = params.items.map((t) => t.trim()).filter(Boolean).slice(0, 3);
  if (items.length === 0) return;

  await supabase.from("entries").upsert(
    {
      user_id: user.id,
      entry_date: params.entryDate,
      items,
      mood: params.mood,
      photos: params.photos,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,entry_date" },
  );

  revalidatePath("/today");
  revalidatePath("/archive");
  revalidatePath("/together");
  revalidatePath("/stats");
}
