import { redirect } from "next/navigation";
import { WelcomeScreens } from "@/components/auth/WelcomeScreens";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ auth_error?: string }>;
}) {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Already signed in? Skip onboarding entirely.
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .single();
      redirect(profile?.nickname ? "/today" : "/onboarding");
    }
  }

  const { auth_error } = await searchParams;

  return <WelcomeScreens authError={auth_error === "1"} />;
}
