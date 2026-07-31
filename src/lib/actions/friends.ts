"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addFriend(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("friends").insert({ user_id: user.id, friend_name: trimmed });
  revalidatePath("/settings");
  revalidatePath("/archive");
  revalidatePath("/together");
}

export async function removeFriend(friendName: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase
    .from("friends")
    .delete()
    .eq("user_id", user.id)
    .eq("friend_name", friendName);
  revalidatePath("/settings");
  revalidatePath("/archive");
  revalidatePath("/together");
}

/** Creates a one-time invite link. Whoever opens it and accepts (after Kakao
 * login) becomes a real linked friend on both sides — see accept_friend_invite(). */
export async function createFriendInvite(): Promise<{ token: string | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .single();

  const token = crypto.randomUUID().replace(/-/g, "");
  const { error } = await supabase.from("friend_invites").insert({
    inviter_id: user.id,
    inviter_name: profile?.nickname?.trim() || "친구",
    token,
  });

  if (error) return { token: null, error: error.message };
  revalidatePath("/settings");
  return { token, error: null };
}

export async function revokeFriendInvite(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase
    .from("friend_invites")
    .update({ status: "revoked" })
    .eq("id", id)
    .eq("inviter_id", user.id);
  revalidatePath("/settings");
}

const INVITE_ERROR_MESSAGES: Record<string, string> = {
  not_authenticated: "로그인이 필요해요.",
  invite_invalid: "유효하지 않거나 만료된 초대 링크예요.",
  invite_self: "내가 만든 초대 링크는 스스로 수락할 수 없어요.",
};

/** Accepts an invite link: links inviter <-> current user as real friends. */
export async function acceptFriendInvite(
  token: string,
): Promise<{ inviterName: string | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data, error } = await supabase.rpc("accept_friend_invite", { p_token: token });

  if (error) {
    const message = INVITE_ERROR_MESSAGES[error.message] ?? "초대를 수락하지 못했어요.";
    return { inviterName: null, error: message };
  }

  revalidatePath("/settings");
  revalidatePath("/together");
  revalidatePath("/archive");
  return { inviterName: data, error: null };
}
