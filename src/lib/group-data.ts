import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";
import { memberColor } from "@/lib/gratitude";

export type GroupSummary = {
  id: string;
  name: string;
  icon: string;
  owner_id: string;
  created_at: string;
};
export type MemberInfo = {
  userId: string | null;
  name: string;
  color: string;
  isMe: boolean;
  linked: boolean;
};

/** Groups the user belongs to, plus the resolved active group + its members (linked and invited). */
export async function loadGroupContext(
  supabase: SupabaseClient<Database>,
  userId: string,
  requestedGroupId: string | undefined,
) {
  const { data: myMemberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId);
  const myGroupIds = (myMemberships ?? []).map((m) => m.group_id);

  const { data: groupRows } = myGroupIds.length
    ? await supabase
        .from("groups")
        .select("id, name, icon, owner_id, created_at")
        .in("id", myGroupIds)
    : { data: [] as GroupSummary[] };
  const groups: GroupSummary[] = groupRows ?? [];

  if (groups.length === 0) {
    return { groups, activeGroup: null as GroupSummary | null, members: [] as MemberInfo[] };
  }

  const activeGroupId =
    requestedGroupId && groups.some((g) => g.id === requestedGroupId)
      ? requestedGroupId
      : groups[0].id;
  const activeGroup = groups.find((g) => g.id === activeGroupId)!;

  const { data: memberRows } = await supabase
    .from("group_members")
    .select("user_id, invited_name")
    .eq("group_id", activeGroupId);

  const linkedUserIds = (memberRows ?? [])
    .map((m) => m.user_id)
    .filter((id): id is string => Boolean(id));

  const { data: memberProfiles } = linkedUserIds.length
    ? await supabase.from("profiles").select("id, nickname").in("id", linkedUserIds)
    : { data: [] as { id: string; nickname: string }[] };
  const nicknameByUserId = new Map((memberProfiles ?? []).map((p) => [p.id, p.nickname]));

  const members: MemberInfo[] = (memberRows ?? []).map((m, i) => ({
    userId: m.user_id,
    name: (m.user_id ? nicknameByUserId.get(m.user_id) : null) || m.invited_name || "친구",
    color: m.user_id === userId ? "var(--color-accent)" : memberColor(i),
    isMe: m.user_id === userId,
    linked: Boolean(m.user_id),
  }));

  return { groups, activeGroup, members };
}
