import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
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

  if (profile?.nickname) redirect("/today");

  const prefilled =
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.nickname as string | undefined) ??
    "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-6">
      <div className="w-full max-w-[400px] animate-fade-up text-center">
        <div className="mb-[22px] inline-flex items-center gap-1.5 rounded-pill bg-panel-2 px-3.5 py-1.5 text-[12.5px] font-semibold text-[#5F6E52]">
          카카오 계정 연결됨
        </div>
        <h1 className="font-serif text-[24px] font-normal leading-relaxed text-ink">
          어떻게 불러드릴까요?
        </h1>
        <OnboardingForm prefilled={prefilled} />
      </div>
    </div>
  );
}
