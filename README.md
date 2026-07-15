# Thanks Log (감사일기)

친구·가족과 함께 쓰는 감사일기. 하루 세 가지 감사 + 사진 + 손그림 스티커 댓글, 그룹 공유 타임라인, "우리 마음 밭" 성장 시각화.

Next.js (App Router) + Supabase (Postgres / Auth / Storage), Kakao OAuth 기반. 디자인 레퍼런스는 [design/handoff](design/handoff)에 있습니다.

## 1. 로컬 개발 시작

```bash
npm install
npm run dev
```

`.env.local`이 없으면 `/today` 이하 모든 화면에 "Supabase 설정이 필요해요" 안내만 뜹니다 (정상 동작). 랜딩 페이지(`/`)는 설정 없이도 바로 확인할 수 있어요.

## 2. Supabase 프로젝트 설정 (필수, 최초 1회)

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 만듭니다.
2. **SQL Editor**에서 [`supabase/schema.sql`](supabase/schema.sql) 전체를 실행합니다. (테이블, RLS 정책, `photos` 스토리지 버킷과 정책까지 한 번에 생성됩니다.)
3. **Project Settings → API**에서 `Project URL`과 `anon public` 키를 복사해 `.env.local`에 채웁니다:

   ```bash
   cp .env.local.example .env.local
   ```

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

## 3. 카카오 로그인 연결

1. [Kakao Developers](https://developers.kakao.com)에서 앱을 만들고, **제품 설정 → 카카오 로그인**을 활성화합니다.
2. **Redirect URI**에 다음을 등록합니다 (로컬 + 배포 도메인 둘 다):
   - `https://<supabase-project-ref>.supabase.co/auth/v1/callback`
3. **앱 키 → REST API 키**와 **보안 → Client Secret**(활성화 권장)을 복사해둡니다.
4. Supabase 대시보드 **Authentication → Providers → Kakao**에서 활성화하고 위 키들을 입력합니다.
5. Supabase **Authentication → URL Configuration**의 Redirect URLs에 다음을 추가합니다:
   - `http://localhost:3000/auth/callback` (로컬)
   - `https://<your-vercel-domain>/auth/callback` (배포)

로그인 버튼(`카카오로 시작하기`)은 `supabase.auth.signInWithOAuth({ provider: 'kakao' })`를 호출하도록 이미 구현되어 있습니다. 위 설정이 끝나면 바로 동작합니다.

## 4. Vercel 배포

1. 이 레포를 GitHub에 올리고 Vercel에서 Import 합니다.
2. Vercel 프로젝트 **Environment Variables**에 `.env.local`과 동일한 두 값을 등록합니다.
3. 배포 후 나온 도메인을 3단계의 Kakao Redirect URI / Supabase Redirect URLs에 추가합니다.

## 스티커에 대해

`public/stickers/placeholder/*.svg`는 실제 손그림 이모티콘 대신 만든 오리지널 플레이스홀더입니다 (저작권이 있는 상용 이모티콘팩을 그대로 자산화하지 않기 위함). 실제 구매한 스티커 세트가 준비되면:

- 같은 파일명으로 교체하거나
- `src/lib/stickers.ts`의 `PLACEHOLDER_STICKERS` 배열에 새 항목을 추가

하면 됩니다. `comments.sticker` 컬럼에는 이미지가 아니라 이름만 저장되므로 DB 변경은 필요 없습니다.

## 알려진 스코프 축소 (다음에 이어서 할 것들)

- **통계 카드 저장(🖼)**: 이미지 내보내기는 미구현 (버튼은 안내 alert만 표시).
- **카카오톡 공유/초대**: UI만 구현되어 있고 실제 카카오톡 메시지 전송(Kakao SDK `Kakao.Share`)은 연결되어 있지 않습니다.
- **저녁 9시 알림**: `profiles.reminder_on` 토글/DB만 존재. 실제 푸시/카카오 알림톡 발송은 Vercel Cron 등 별도 구현이 필요합니다 (README 원본 9번 항목 참고).
- **그룹 멤버 초대**: "내 친구" 목록에 있고 실제로 앱을 쓰는 사람만 그룹에 실시간 연동됩니다. 아직 앱을 쓰지 않는 사람은 이름만 저장된 "초대 대기중" 상태로 남고, 실제 카카오톡 메시지 발송은 연결돼 있지 않습니다.
