import { redirect } from "next/navigation";
import { TogetherScreen, type FeedEntry } from "@/components/together/TogetherScreen";
import { createClient } from "@/lib/supabase/server";
import { signPhotoUrls } from "@/lib/storage";
import { dateLabel } from "@/lib/gratitude";
import { loadGroupContext } from "@/lib/group-data";

export default async function TogetherPage({
  searchParams,
}: {
  searchParams: Promise<{ g?: string }>;
}) {
  const { g } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { groups, activeGroup, members } = await loadGroupContext(supabase, user.id, g);

  const { data: friendRows } = await supabase
    .from("friends")
    .select("friend_name")
    .eq("user_id", user.id);
  const friendNames = (friendRows ?? []).map((f) => f.friend_name);

  if (!activeGroup) {
    return (
      <TogetherScreen
        groups={[]}
        activeGroup={null}
        members={[]}
        feed={[]}
        friendNames={friendNames}
        myUserId={user.id}
      />
    );
  }

  const linkedIds = members.filter((m) => m.linked && m.userId).map((m) => m.userId as string);

  let feed: FeedEntry[] = [];
  if (linkedIds.length > 0) {
    const { data: entryRows } = await supabase
      .from("entries")
      .select("id, user_id, entry_date, items, photos")
      .in("user_id", linkedIds)
      .order("entry_date", { ascending: false });

    const entries = entryRows ?? [];
    const entryIds = entries.map((e) => e.id);
    const allPaths = entries.flatMap((e) => e.photos);
    const signedMap = await signPhotoUrls(supabase, allPaths);

    const { data: heartRows } = entryIds.length
      ? await supabase.from("hearts").select("entry_id, user_id").in("entry_id", entryIds)
      : { data: [] as { entry_id: string; user_id: string }[] };

    const { data: commentRows } = entryIds.length
      ? await supabase
          .from("comments")
          .select("id, entry_id, user_id, body, sticker, created_at")
          .in("entry_id", entryIds)
          .order("created_at", { ascending: true })
      : { data: [] as { id: string; entry_id: string; user_id: string; body: string | null; sticker: string | null }[] };

    const memberByUserId = new Map(members.map((m) => [m.userId, m]));

    feed = entries.map((e) => {
      const author = memberByUserId.get(e.user_id);
      const hearts = (heartRows ?? []).filter((h) => h.entry_id === e.id);
      const comments = (commentRows ?? [])
        .filter((c) => c.entry_id === e.id)
        .map((c) => {
          const cAuthor = memberByUserId.get(c.user_id);
          return {
            id: c.id,
            authorName: cAuthor?.name ?? "친구",
            authorColor: cAuthor?.color ?? "var(--color-accent)",
            body: c.body,
            sticker: c.sticker,
            mine: c.user_id === user.id,
          };
        });

      return {
        entryId: e.id,
        authorUserId: e.user_id,
        authorName: author?.name ?? "친구",
        authorColor: author?.color ?? "var(--color-accent)",
        dateLabel: dateLabel(e.entry_date, false),
        items: e.items,
        photoUrls: e.photos.map((p) => signedMap[p]).filter(Boolean) as string[],
        heartCount: hearts.length,
        heartedByMe: hearts.some((h) => h.user_id === user.id),
        comments,
      };
    });
  }

  return (
    <TogetherScreen
      groups={groups}
      activeGroup={activeGroup}
      members={members}
      feed={feed}
      friendNames={friendNames}
      myUserId={user.id}
    />
  );
}
