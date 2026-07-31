import { redirect } from "next/navigation";
import { InviteAcceptScreen } from "@/components/invite/InviteAcceptScreen";
import { createClient } from "@/lib/supabase/server";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Logged in but never finished onboarding (e.g. tab closed mid-flow) — finish
  // that first, then bounce straight back to this invite link.
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", user.id)
      .single();
    if (!profile?.nickname) redirect(`/onboarding?next=/invite/${token}`);
  }

  const { data: previewRows } = await supabase.rpc("get_invite_preview", { p_token: token });
  const preview = previewRows?.[0] ?? null;

  return (
    <InviteAcceptScreen
      token={token}
      inviterName={preview?.inviter_name ?? null}
      previewStatus={preview ? (preview.status as "pending" | "accepted" | "revoked") : "not_found"}
      isSelf={!!user && !!preview && user.id === preview.inviter_id}
      isLoggedIn={!!user}
    />
  );
}
