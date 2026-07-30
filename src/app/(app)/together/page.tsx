import { redirect } from "next/navigation";

/** "함께" 탭은 "기록" 안으로 합쳐졌어요. 옛 링크/북마크가 계속 동작하도록 리다이렉트만 해요. */
export default async function TogetherRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ g?: string }>;
}) {
  const { g } = await searchParams;
  redirect(g ? `/archive?g=${g}&view=feed` : "/archive?view=feed");
}
