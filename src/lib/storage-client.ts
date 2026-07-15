import { createClient } from "@/lib/supabase/client";

/** Client-side helper: upload a File to the private 'photos' bucket, return its object path. */
export async function uploadPhotoFile(
  file: File,
  userId: string,
  entryDate: string,
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${entryDate}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}
