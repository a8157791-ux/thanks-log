"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createGroup(name: string, icon: string, memberNames: string[]) {
  const trimmedName = name.trim();
  if (!trimmedName) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: group, error } = await supabase
    .from("groups")
    .insert({ name: trimmedName, icon, owner_id: user.id })
    .select("id")
    .single();
  if (error || !group) return;

  await supabase
    .from("group_members")
    .insert({ group_id: group.id, user_id: user.id, role: "owner" });

  for (const rawName of memberNames) {
    await addGroupMemberByName(group.id, rawName);
  }

  revalidatePath("/together");
  revalidatePath("/stats");
}

/** Adds a member by name: links to a real profile if the name matches a friend who already uses
 * the app, otherwise stores it as an "invited, not yet joined" placeholder row. */
export async function addGroupMemberByName(groupId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: friend } = await supabase
    .from("friends")
    .select("friend_id")
    .eq("user_id", user.id)
    .eq("friend_name", trimmed)
    .maybeSingle();

  if (friend?.friend_id) {
    const { data: existing } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", friend.friend_id)
      .maybeSingle();
    if (!existing) {
      await supabase
        .from("group_members")
        .insert({ group_id: groupId, user_id: friend.friend_id, role: "member" });
    }
  } else {
    await supabase.from("group_members").insert({
      group_id: groupId,
      user_id: null,
      invited_name: trimmed,
      role: "member",
    });
  }

  revalidatePath("/together");
  revalidatePath("/stats");
}

/** RLS (groups_update policy) already restricts this to the group's owner_id. */
export async function updateGroupName(groupId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("groups").update({ name: trimmed }).eq("id", groupId);

  revalidatePath("/together");
  revalidatePath("/stats");
}

export async function removeGroupMember(groupId: string, userId: string | null, invitedName?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  let query = supabase.from("group_members").delete().eq("group_id", groupId);
  query = userId ? query.eq("user_id", userId) : query.eq("invited_name", invitedName ?? "");
  await query;

  revalidatePath("/together");
  revalidatePath("/stats");
}
