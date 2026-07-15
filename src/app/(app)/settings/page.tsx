import { redirect } from "next/navigation";
import { SettingsScreen, type FriendRow } from "@/components/settings/SettingsScreen";
import { createClient } from "@/lib/supabase/server";
import { signPhotoUrls } from "@/lib/storage";
import { memberColor } from "@/lib/gratitude";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data: profile }, { data: friendRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("nickname, avatar_url, reminder_on")
      .eq("id", user.id)
      .single(),
    supabase.from("friends").select("friend_name").eq("user_id", user.id).order("created_at"),
  ]);

  let avatarUrl: string | null = profile?.avatar_url ?? null;
  if (avatarUrl && !avatarUrl.startsWith("http")) {
    const signed = await signPhotoUrls(supabase, [avatarUrl]);
    avatarUrl = signed[avatarUrl] ?? null;
  }

  const friends: FriendRow[] = (friendRows ?? []).map((f, i) => ({
    name: f.friend_name,
    color: memberColor(i),
  }));

  return (
    <SettingsScreen
      userId={user.id}
      nickname={profile?.nickname ?? ""}
      avatarUrl={avatarUrl}
      reminderOn={profile?.reminder_on ?? true}
      friends={friends}
    />
  );
}
