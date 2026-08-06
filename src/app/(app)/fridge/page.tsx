import { redirect } from "next/navigation";
import { FridgeScreen } from "@/components/fridge/FridgeScreen";
import { createClient } from "@/lib/supabase/server";

export default async function FridgePage({
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

  const [{ data: memberRows }, { data: profile }] = await Promise.all([
    supabase.from("group_members").select("group_id").eq("user_id", user.id),
    supabase.from("profiles").select("default_fridge_group_id").eq("id", user.id).single(),
  ]);
  const myGroupIds = (memberRows ?? []).map((m) => m.group_id);

  const { data: groupRows } = myGroupIds.length
    ? await supabase.from("groups").select("id, name, icon").in("id", myGroupIds)
    : { data: [] as { id: string; name: string; icon: string }[] };
  const groups = groupRows ?? [];

  const rawDefault = profile?.default_fridge_group_id ?? null;
  const defaultGroupId = rawDefault && groups.some((group) => group.id === rawDefault) ? rawDefault : null;

  // ?g=personal → explicitly personal. ?g=<id> → that group (if a member).
  // No ?g at all → fall back to the saved default fridge (or personal).
  const activeGroupId =
    g === "personal"
      ? null
      : g && groups.some((group) => group.id === g)
        ? g
        : g
          ? null
          : defaultGroupId;

  const fridgeQuery = activeGroupId
    ? supabase
        .from("fridge_items")
        .select("id, user_id, group_id, zone, name, created_at")
        .eq("group_id", activeGroupId)
        .order("created_at", { ascending: true })
    : supabase
        .from("fridge_items")
        .select("id, user_id, group_id, zone, name, created_at")
        .eq("user_id", user.id)
        .is("group_id", null)
        .order("created_at", { ascending: true });

  const [{ data: items }, { data: saved }, { data: shopping }, { data: ideas }, { data: passed }] =
    await Promise.all([
      fridgeQuery,
      supabase
        .from("saved_recipes")
        .select("id, user_id, name, minutes, matched, missing, link, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("shopping_items")
        .select("id, user_id, name, done, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("menu_ideas")
        .select("id, user_id, note, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("passed_recipes").select("name").eq("user_id", user.id),
    ]);

  // 추천 메뉴 셔플 seed를 서버에서 한 번 정해서 넘긴다. (클라이언트가 Math.random을
  // 다시 굴리면 hydration 불일치가 나서.) 요청 시각에서 뽑아 새로고침마다 조합이 바뀜.
  const recSeed = new Date().getTime() >>> 0;

  return (
    <FridgeScreen
      key={activeGroupId ?? "personal"}
      initialItems={items ?? []}
      initialSaved={saved ?? []}
      initialShopping={shopping ?? []}
      initialIdeas={ideas ?? []}
      initialPassed={(passed ?? []).map((p) => p.name)}
      groups={groups}
      activeGroupId={activeGroupId}
      defaultGroupId={defaultGroupId}
      recSeed={recSeed}
    />
  );
}
