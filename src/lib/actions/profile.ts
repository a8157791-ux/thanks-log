"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(nickname: string, next?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase
    .from("profiles")
    .update({ nickname: nickname.trim() || "친구" })
    .eq("id", user.id);

  redirect(next?.startsWith("/") ? next : "/today");
}

export async function updateNickname(nickname: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("profiles").update({ nickname: nickname.trim() }).eq("id", user.id);
  revalidatePath("/settings");
}

export async function toggleReminder(next: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("profiles").update({ reminder_on: next }).eq("id", user.id);
  revalidatePath("/settings");
}

export async function updateAvatar(avatarUrl: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
  revalidatePath("/settings");
}

/** 냉장고 페이지를 열었을 때 가장 먼저 보여줄 곳. null = 내 냉장고(개인). */
export async function setDefaultFridge(groupId: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("profiles").update({ default_fridge_group_id: groupId }).eq("id", user.id);
  revalidatePath("/fridge");
}

/** 기록 페이지를 열었을 때 가장 먼저 보여줄 곳. null = 내 기록(개인). */
export async function setDefaultRecord(groupId: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("profiles").update({ default_record_group_id: groupId }).eq("id", user.id);
  revalidatePath("/archive");
}

/** 모든 데이터 초기화: entries/comments/hearts 등 본인 소유 데이터를 지운다 (그룹 멤버십은 유지). */
export async function resetMyData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  await supabase.from("entries").delete().eq("user_id", user.id);
  await supabase.from("friends").delete().eq("user_id", user.id);
  revalidatePath("/today");
  revalidatePath("/archive");
  revalidatePath("/stats");
  revalidatePath("/settings");
}
