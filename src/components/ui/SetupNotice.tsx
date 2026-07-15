export function SetupNotice() {
  return (
    <div className="mx-auto max-w-[640px] px-6 py-10">
      <div className="rounded-card border border-border-2 bg-card p-6">
        <p className="font-serif text-[18px] text-ink">Supabase 설정이 필요해요</p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
          <code className="rounded bg-panel px-1.5 py-0.5">.env.local</code>에{" "}
          <code className="rounded bg-panel px-1.5 py-0.5">
            NEXT_PUBLIC_SUPABASE_URL
          </code>
          과{" "}
          <code className="rounded bg-panel px-1.5 py-0.5">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>
          를 채우고 <code className="rounded bg-panel px-1.5 py-0.5">supabase/schema.sql</code>을
          실행한 뒤 다시 시도해주세요.
        </p>
      </div>
    </div>
  );
}
