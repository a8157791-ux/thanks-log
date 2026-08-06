import { redirect } from "next/navigation";
import { CookbookScreen } from "@/components/cookbook/CookbookScreen";
import { createClient } from "@/lib/supabase/server";

export default async function CookbookPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: cooked } = await supabase
    .from("cooked_dishes")
    .select("id, user_id, name, link, note, cooked_on, created_at")
    .eq("user_id", user.id)
    .order("cooked_on", { ascending: false })
    .order("created_at", { ascending: false });

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return <CookbookScreen initialCooked={cooked ?? []} today={today} />;
}
