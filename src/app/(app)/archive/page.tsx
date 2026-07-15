import { redirect } from "next/navigation";
import { ArchiveScreen, type ArchiveEntry } from "@/components/archive/ArchiveScreen";
import { createClient } from "@/lib/supabase/server";
import { signPhotoUrls } from "@/lib/storage";
import { todayKey } from "@/lib/gratitude";

export default async function ArchivePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: rows } = await supabase
    .from("entries")
    .select("entry_date, items, mood, photos")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false });

  const allPaths = (rows ?? []).flatMap((r) => r.photos);
  const signedMap = await signPhotoUrls(supabase, allPaths);

  const entries: Record<string, ArchiveEntry> = {};
  for (const row of rows ?? []) {
    entries[row.entry_date] = {
      items: row.items,
      mood: row.mood,
      photoUrls: row.photos.map((p) => signedMap[p]).filter(Boolean) as string[],
    };
  }

  return <ArchiveScreen entries={entries} todayKey={todayKey()} />;
}
