import { redirect } from "next/navigation";
import { TopNav } from "@/components/nav/TopNav";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col px-6">
        <TopNav />
        <main className="flex-1 pb-16">
          <SetupNotice />
        </main>
      </div>
    );
  }

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

  if (!profile?.nickname) redirect("/onboarding");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col px-6">
      <TopNav />
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}
