import { redirect } from "next/navigation";
import { TodayScreen } from "@/components/today/TodayScreen";
import { createClient } from "@/lib/supabase/server";
import { signPhotoUrls } from "@/lib/storage";
import { dateLabel, todayKey } from "@/lib/gratitude";
import { calcStreak } from "@/lib/gratitude";

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data: profile }, { data: entries }] = await Promise.all([
    supabase.from("profiles").select("nickname").eq("id", user.id).single(),
    supabase
      .from("entries")
      .select("entry_date, items, mood, photos")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: false }),
  ]);

  const tk = todayKey();
  const rows = entries ?? [];
  const todayRow = rows.find((r) => r.entry_date === tk) ?? null;
  const streak = calcStreak(rows.map((r) => r.entry_date)).current;

  const otherKeys = rows.filter((r) => r.entry_date !== tk);
  // eslint-disable-next-line react-hooks/purity -- one-shot per-request pick in a Server Component, not a re-rendered client component
  const memoryRow = otherKeys.length > 0 ? otherKeys[Math.floor(Math.random() * otherKeys.length)] : null;

  const allPaths = [
    ...(todayRow?.photos ?? []),
  ];
  const signedMap = await signPhotoUrls(supabase, allPaths);

  const initialEntry = todayRow
    ? {
        items: todayRow.items,
        mood: todayRow.mood,
        photos: todayRow.photos.map((path) => ({ path, url: signedMap[path] ?? "" })),
      }
    : null;

  const memory = memoryRow
    ? { dateLabel: dateLabel(memoryRow.entry_date, true), preview: memoryRow.items[0] ?? "" }
    : null;

  const nickname = profile?.nickname ?? "";

  return (
    <TodayScreen
      userId={user.id}
      todayKey={tk}
      todayLabel={dateLabel(tk, true)}
      greeting={`${nickname ? nickname + "님, " : ""}안녕하세요.`}
      streak={streak}
      initialEntry={initialEntry}
      memory={memory}
    />
  );
}
