import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  // Only accept same-origin relative paths — never forward an external redirect target.
  const next = rawNext?.startsWith("/") ? rawNext : null;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", data.user.id)
        .single();

      if (!profile?.nickname) {
        const onboardingUrl = new URL("/onboarding", origin);
        if (next) onboardingUrl.searchParams.set("next", next);
        return NextResponse.redirect(onboardingUrl.toString());
      }

      return NextResponse.redirect(`${origin}${next ?? "/today"}`);
    }
  }

  return NextResponse.redirect(`${origin}/?auth_error=1`);
}
