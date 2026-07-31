import { redirect } from "next/navigation";
import { RecordScreen } from "@/components/archive/RecordScreen";
import type { FeedEntry, GroupSummary, MemberInfo } from "@/components/together/TogetherScreen";
import { createClient } from "@/lib/supabase/server";
import { signPhotoUrls } from "@/lib/storage";
import { dateLabel, todayKey } from "@/lib/gratitude";
import { loadGroupContext } from "@/lib/group-data";
import { listPlaceholderStickers } from "@/lib/sticker-files";

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ g?: string; view?: string }>;
}) {
  const { g, view: viewParam } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data: memberRows }, { data: friendRows }, { data: profile }] = await Promise.all([
    supabase.from("group_members").select("group_id").eq("user_id", user.id),
    supabase.from("friends").select("friend_name").eq("user_id", user.id),
    supabase.from("profiles").select("nickname, default_record_group_id").eq("id", user.id).single(),
  ]);
  const myGroupIds = (memberRows ?? []).map((m) => m.group_id);
  const friendNames = (friendRows ?? []).map((f) => f.friend_name);
  const placeholderStickers = listPlaceholderStickers();

  const { data: groupRows } = myGroupIds.length
    ? await supabase.from("groups").select("id, name, icon, owner_id, created_at").in("id", myGroupIds)
    : { data: [] as GroupSummary[] };
  const groups = groupRows ?? [];

  const rawDefault = profile?.default_record_group_id ?? null;
  const defaultGroupId = rawDefault && groups.some((gr) => gr.id === rawDefault) ? rawDefault : null;

  // ?g=personal → explicitly personal. ?g=<id> → that group (if a member).
  // No ?g at all → fall back to the saved default record group (or personal).
  const requestedGroupId =
    g === "personal"
      ? undefined
      : g && groups.some((gr) => gr.id === g)
        ? g
        : g
          ? undefined
          : (defaultGroupId ?? undefined);
  const isGroupSelected = Boolean(requestedGroupId);

  let activeGroup: GroupSummary | null = null;
  let members: MemberInfo[] = [];
  if (isGroupSelected) {
    const ctx = await loadGroupContext(supabase, user.id, requestedGroupId);
    activeGroup = ctx.activeGroup;
    members = ctx.members;
  }

  const view = viewParam === "feed" || viewParam === "calendar" ? viewParam : activeGroup ? "feed" : "calendar";

  const scheduleQuery = activeGroup
    ? supabase
        .from("schedule_items")
        .select("id, user_id, group_id, title, event_date, created_at")
        .eq("group_id", activeGroup.id)
        .order("event_date", { ascending: true })
    : supabase
        .from("schedule_items")
        .select("id, user_id, group_id, title, event_date, created_at")
        .eq("user_id", user.id)
        .is("group_id", null)
        .order("event_date", { ascending: true });
  const { data: scheduleRows } = await scheduleQuery;

  let feed: FeedEntry[] = [];

  if (activeGroup) {
    const linkedIds = members.filter((m) => m.linked && m.userId).map((m) => m.userId as string);

    if (linkedIds.length > 0) {
      const { data: entryRows } = await supabase
        .from("entries")
        .select("id, user_id, entry_date, items, photos, mood")
        .in("user_id", linkedIds)
        .order("entry_date", { ascending: false });

      const entries = entryRows ?? [];
      const entryIds = entries.map((e) => e.id);
      const allPaths = entries.flatMap((e) => e.photos);

      const [signedMap, { data: heartRows }, { data: commentRows }] = await Promise.all([
        signPhotoUrls(supabase, allPaths),
        entryIds.length
          ? supabase.from("hearts").select("entry_id, user_id").in("entry_id", entryIds)
          : Promise.resolve({ data: [] as { entry_id: string; user_id: string }[] }),
        entryIds.length
          ? supabase
              .from("comments")
              .select("id, entry_id, user_id, body, sticker, created_at")
              .in("entry_id", entryIds)
              .order("created_at", { ascending: true })
          : Promise.resolve({
              data: [] as { id: string; entry_id: string; user_id: string; body: string | null; sticker: string | null }[],
            }),
      ]);

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
          entryDate: e.entry_date,
          dateLabel: dateLabel(e.entry_date, false),
          mood: e.mood,
          items: e.items,
          photoUrls: e.photos.map((p) => signedMap[p]).filter(Boolean) as string[],
          heartCount: hearts.length,
          heartedByMe: hearts.some((h) => h.user_id === user.id),
          comments,
        };
      });
    }
  } else {
    const { data: entryRows } = await supabase
      .from("entries")
      .select("id, user_id, entry_date, items, photos, mood")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: false });

    const entries = entryRows ?? [];
    const allPaths = entries.flatMap((e) => e.photos);
    const signedMap = await signPhotoUrls(supabase, allPaths);
    const myName = profile?.nickname || "나";

    feed = entries.map((e) => ({
      entryId: e.id,
      authorUserId: e.user_id,
      authorName: myName,
      authorColor: "var(--color-accent)",
      entryDate: e.entry_date,
      dateLabel: dateLabel(e.entry_date, true),
      mood: e.mood,
      items: e.items,
      photoUrls: e.photos.map((p) => signedMap[p]).filter(Boolean) as string[],
      heartCount: 0,
      heartedByMe: false,
      comments: [],
    }));
  }

  return (
    <RecordScreen
      key={(activeGroup?.id ?? "personal") + view}
      groups={groups}
      activeGroup={activeGroup}
      defaultGroupId={defaultGroupId}
      members={members}
      view={view}
      feed={feed}
      schedule={scheduleRows ?? []}
      todayKey={todayKey()}
      friendNames={friendNames}
      myUserId={user.id}
      placeholderStickers={placeholderStickers}
    />
  );
}
