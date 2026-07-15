import { redirect } from "next/navigation";
import { StatsScreen, type GardenCell, type MemberShare } from "@/components/stats/StatsScreen";
import { createClient } from "@/lib/supabase/server";
import { loadGroupContext } from "@/lib/group-data";
import { calcGardenStage, lastNDayKeys, topKeyword, totalItemCount } from "@/lib/gratitude";

export default async function StatsPage({
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

  if (!activeGroup) {
    return (
      <StatsScreen
        groups={[]}
        activeGroup={null}
        members={[]}
        stage={{ name: "씨앗", icon: "leaf", min: 0, next: 10, tint: "#f1eee6" }}
        progressPct={0}
        nextLabel=""
        togetherDays={0}
        gardenTotal={0}
        memberShare={[]}
        gardenCells={[]}
        topKeyword={null}
      />
    );
  }

  const linkedIds = members.filter((m) => m.linked && m.userId).map((m) => m.userId as string);

  const { data: entryRows } = linkedIds.length
    ? await supabase
        .from("entries")
        .select("user_id, entry_date, items")
        .in("user_id", linkedIds)
    : { data: [] as { user_id: string; entry_date: string; items: string[] }[] };

  const entries = entryRows ?? [];
  const gardenTotal = totalItemCount(entries);
  const { stage, progressPct, nextLabel } = calcGardenStage(gardenTotal);

  /* eslint-disable react-hooks/purity -- one-shot per-request calculation in a Server Component, not a re-rendered client component */
  const togetherDays = Math.max(
    1,
    Math.ceil((Date.now() - new Date(activeGroup.created_at).getTime()) / 86_400_000) + 1,
  );
  /* eslint-enable react-hooks/purity */

  const memberByUserId = new Map(members.map((m) => [m.userId, m]));
  const countByMember = new Map<string, number>();
  for (const e of entries) {
    countByMember.set(e.user_id, (countByMember.get(e.user_id) ?? 0) + e.items.length);
  }
  const memberShare: MemberShare[] = members
    .filter((m) => m.linked && m.userId)
    .map((m) => {
      const count = countByMember.get(m.userId as string) ?? 0;
      return {
        name: m.name,
        color: m.color,
        count,
        pct: gardenTotal > 0 ? Math.round((count / gardenTotal) * 100) : 0,
      };
    });

  const dayKeys = lastNDayKeys(35);
  const entriesByDay = new Map<string, string>(); // day -> userId of first poster
  for (const e of entries) {
    if (!entriesByDay.has(e.entry_date)) entriesByDay.set(e.entry_date, e.user_id);
  }
  const gardenCells: GardenCell[] = dayKeys.map((key) => {
    const posterId = entriesByDay.get(key);
    const poster = posterId ? memberByUserId.get(posterId) : null;
    return { key, label: key, color: poster ? poster.color : null };
  });

  const top = topKeyword(entries.map((e) => e.items));

  return (
    <StatsScreen
      groups={groups}
      activeGroup={activeGroup}
      members={members}
      stage={stage}
      progressPct={progressPct}
      nextLabel={nextLabel}
      togetherDays={togetherDays}
      gardenTotal={gardenTotal}
      memberShare={memberShare}
      gardenCells={gardenCells}
      topKeyword={top}
    />
  );
}
