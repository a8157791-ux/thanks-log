import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

/** Server-side helper: turn stored object paths into short-lived signed URLs for a private bucket. */
export async function signPhotoUrls(
  supabase: SupabaseClient<Database>,
  paths: string[],
): Promise<Record<string, string>> {
  if (paths.length === 0) return {};

  const { data, error } = await supabase.storage
    .from("photos")
    .createSignedUrls(paths, 3600);

  if (error || !data) return {};

  const map: Record<string, string> = {};
  data.forEach((entry) => {
    if (entry.signedUrl && !entry.error) map[entry.path ?? ""] = entry.signedUrl;
  });
  return map;
}
