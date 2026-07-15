# Handoff: 감사일기 (Gratitude Diary) 웹앱

친구·가족과 함께 쓰는 감사일기. 하루 세 가지 감사 + 사진 + 손그림 스티커 댓글, 그룹 공유 타임라인, "우리 마음 밭" 성장 시각화.

Stack the owner already has accounts for: **Vercel + GitHub + Supabase**. Recommended target: **Next.js (App Router) on Vercel + Supabase (Postgres + Auth + Storage), Kakao OAuth**.

---

## 1. About the design files
The files in this bundle are **design references created in HTML** (Design Components) — working prototypes that show the intended look, copy, and interactions. They are **not** production code to ship as-is. The task is to **recreate these designs in a real Next.js/React codebase** using its own component patterns, wiring the UI to Supabase for data/auth/storage. All state in the prototype is held in React + `localStorage`; replace that with Supabase.

- `Gratitude Diary.dc.html` — the full app (오늘 / 기록 / 함께 / 통계 / 설정 + 온보딩).
- `Landing.dc.html` — marketing landing page with "카카오로 시작하기" CTA into the app.
- `supabase_schema.sql` — ready-to-run Postgres schema + Row Level Security policies.
- Stickers/photos live in the project's `assets/` folder (see §7).

## 2. Fidelity
**High-fidelity.** Colors, type, spacing, copy, and interactions are final. Recreate pixel-accurately, then connect to the backend. Warm minimal aesthetic — lots of whitespace, paper tone, serif headings.

---

## 3. Do you need a database? — Yes
Anything that must survive device changes or be shared with others needs the server:
- **Entries** (일기), **photos**, **groups & members**, **hearts**, **comments/stickers**, **friends**, **profile/nickname/avatar**.
- Use **Supabase Postgres** with the schema in `supabase_schema.sql`. Row Level Security is defined so a user sees their own entries plus those of anyone they share a group with.
- **Photos** → Supabase Storage (private `photos` bucket), path `{user_id}/{date}/{uuid}.jpg`. Store only object paths in `entries.photos`.
- **Stickers** are static app assets (see §7) — store only the sticker *name* (e.g. `tux21`) in `comments.sticker`, never the image.

## 4. Auth (Kakao)
- Supabase Auth → enable **Kakao** OAuth provider (Kakao Developers app key + redirect URL). No custom link-invite flow.
- On first login a `profiles` row is auto-created (trigger in the SQL) with the Kakao nickname + avatar; both are editable in 설정.
- **Do NOT import the user's whole Kakao friend list.** Only surface friends who already use the app (via your own `friends`/`group_members` records); everyone else is invited via a Kakao message ("카카오톡으로 친구 초대하기"). This is reflected in the invite sheet design.

---

## 5. Screens / Views
Container: single centered column, `max-width: 640px`, `padding: 0 24px`. Sticky-feeling top nav with 4 tabs. Landing page is full-width (`max-width: 1080px`).

### Top nav
Tabs: **오늘 · 기록 · 함께 · 통계 · 설정**. Active tab = `#37322C`, bold, 1.5px bottom border; inactive = `#9C958A`. Brand wordmark "감사일기" left, Gowun Batang 20px 700.

### 오늘 (Today / compose)
- Header: date label (`YYYY년 M월 D일 요일`, muted `#8A8378`), serif greeting "{nickname}님, 안녕하세요.\n오늘의 감사 세 가지를 남겨보세요."
- **Not yet saved:** mood picker row (5 Phosphor faces: `ph-smiley`, `ph-smiley-wink`, `ph-smiley-meh`, `ph-heart`, `ph-smiley-nervous`; selected chip bg = accent+`2e`), then 3 input cards (一 二 三, white, `border #E9E4DB`, radius 14, textarea), photo strip (multi-upload, individual remove), 사진 첨부 dashed label + 기록하기 button (disabled until ≥1 line; enabled bg `#37322C`).
- **Saved:** completion card with mood face + "오늘의 기록 완료 ✓", streak label "N일 연속 기록 중 🔥", the 3 items, photo slider, 수정하기 / 친구에게 공유 buttons.
- **이날을 기억하세요:** below a divider, a random past entry card (bg `#F3F0E9`) that opens the detail modal.

### 기록 (Archive / photo-log calendar)
- Month header + ‹ › nav. Weekday row (일~토).
- Calendar grid `repeat(7,1fr)`, cells `aspect-ratio: 0.72`, scrapbook style: each day = white card with date + hand-drawn mood face + **photo collage** (1/2/3-up layouts). Empty days = dashed tile.
- Selecting a day scrolls to that day's gratitude list; tapping a list item opens the detail popup. "오늘" button returns to today.

### 함께 (Together / group feed)
- Group tab chips (icon + name; active = dark pill) + "+ 그룹" dashed chip → group create modal.
- Group header card: overlapping member avatars, group name, "구성원 · 함께 N일째 🔥", **멤버** button → member-management modal.
- Filter chips: 전체 + one per member.
- Feed: entry cards (left border = author color) with author avatar/name/date, photo slider, 3 items, and an action row: **heart** (fill toggles, count) + **comment** count.
- **Comments are inline & collapsible** (NOT a modal): tapping the comment icon expands a section under the card with the comment list + composer. Composer = round **sticker button** (opens sectioned sticker picker) + text input + 등록 button. My own comments/stickers show a **삭제** action. Stickers render as ~68px images.

### 통계 (Stats / "우리 마음 밭")
- Group selector chips + 🖼 카드 저장.
- **Growth card:** big stage emoji, "{group}의 밭이 {stage} 단계예요", "함께 N일 · 감사 M개", progress bar to next stage. Stages by total gratitude count: 씨앗(0) → 새싹(10) → 꽃밭(30) → 우거진 밭(60). Tint per stage.
- **멤버별 텃밭:** proportional color bar + legend.
- **지난 5주의 밭:** 7-col grid, each day tinted by member color and filled with photo collage when photos exist.
- **가장 크게 핀 꽃:** most frequent gratitude keyword (simple frequency count, stopword-filtered).

### 설정 (Settings)
- Profile row: circular avatar (upload / fallback = nickname initial on accent), **닉네임** inline edit.
- **클라우드 백업** row (카카오 계정에 저장, 기기 변경해도 유지) — status label.
- 저녁 알림 toggle. **카카오톡으로 공유** (yellow `#FEE500`).
- **내 친구** card: list with avatars + 삭제, **카카오 친구 초대** (yellow) → invite sheet, plus 직접 추가 input.
- 모든 데이터 초기화 (destructive text button).

### Modals / sheets (all bottom-sheet style, radius 22 top, grabber bar)
- **그룹 만들기:** step0 icon picker + name; step1 member selection (내 친구 chips + 직접 추가 + 카카오톡으로 초대).
- **멤버 관리:** current members (owner fixed, others 내보내기) + 내 친구에서 추가 + 직접 추가.
- **카카오 친구 초대 시트:** "앱을 함께 쓰는 친구" list (추가), privacy note, footer "카카오톡으로 친구 초대하기".
- **일기 상세 팝업:** date, 3 items, photo slider (center modal, not bottom sheet).
- **온보딩:** step0 "카카오로 시작하기" (yellow); step1 nickname (prefilled from Kakao, editable).
- **토스트:** dark pill, bottom-center, auto-dismiss ~2.2s.

---

## 6. Design tokens
**Color**
- Page bg `#FAF8F3`; card bg `#FFFFFF`; soft panel `#F3F0E9` / `#F0EDE5` / `#F5F1E9`.
- Ink `#37322C`; body muted `#6B655B`; faint `#8A8378`; hint `#B9B2A5` / `#B0A896`.
- Borders `#E9E4DB` / `#E0DACF`; divider `#F0EDE5`.
- Accent (sage, tweakable) `#7D8B6F`; alt accents `#A98467`, `#8E9AAF`, `#B0713F`.
- Member colors: `#B08968`, `#9A8C98`, `#6D9DC5`, `#C08497`, `#7D8B6F`, `#C98A5E`.
- Heart `#C86B5C`; fire `#D08A4E`; destructive `#9A6A5F`.
- **Kakao yellow `#FEE500`, ink on yellow `#191600`.**

**Type**
- Headings/display: **Gowun Batang** (serif), weight 400 mostly. Body/UI: **Pretendard**.
- Scale: nav 14 / body 14.5–16 / entry item 14.5–15.5 / greeting 26 serif / section h2 22 serif / landing h1 46 serif. `letter-spacing: -0.01em` on big serif; `text-wrap: pretty` on paragraphs.

**Radius** 8 (buttons) · 10–14 (cards/inputs) · 16–22 (panels/sheets) · 99 (pills/toggles).
**Shadow** cards mostly border-only; hero card `0 18px 40px rgba(90,80,60,.10)`.
**Icons** Phosphor (`@phosphor-icons/web`), regular + `ph-fill` variants.

---

## 7. Assets
- **Stickers:** `assets/stickers/*.png` — hand-drawn, white bg removed to transparent. Sets: `bear01–24`, `cat01–24`, `cub01–24`, `tux01–24`, plus doodle icons (`heart`, `heart-outline`, `smile`, `sad`, `thumbsup`, `clap`, `star`, `clover`, `flower`, `cake`, `beer`, `camera`, `bulb`, `pencil`, `coins`, `hand`, `skull`, `dead`, `calendar`, `pin`). Ship these in `/public/stickers/`. Picker groups: ⭐자주 쓰는 (favorites) first, then 곰/고양이/아기곰/턱시도/기본.
- **Seed photos** (`assets/photo-*.jpg`, `assets/p*.webp`) are prototype placeholders only — not needed in prod.
- Fonts via CDN: Pretendard (jsdelivr), Gowun Batang (Google Fonts), Phosphor (unpkg) — or self-host.

## 8. State → data mapping
| Prototype state (localStorage `gratitude-v2`) | Supabase |
|---|---|
| `entries[date] = {items, photos, mood}` | `entries` rows |
| `groups[].members[]` | `groups` + `group_members` |
| `hearts[entryId]` | `hearts` |
| `comments[entryId] = [{author, body/sticker}]` | `comments` |
| `friends[]` | `friends` |
| `name`, `profilePhoto`, `reminder` | `profiles` |

Streak = consecutive days up to today with an `entries` row. "마음 밭" totals aggregate all group members' entries (respect RLS).

## 9. Deploy checklist
1. New GitHub repo → Next.js app (`npx create-next-app`), `@supabase/supabase-js` + `@supabase/ssr`.
2. Supabase project → run `supabase_schema.sql` → create private `photos` storage bucket → enable Kakao auth provider.
3. Env vars in Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (+ Kakao keys per Supabase auth config).
4. Import repo into Vercel → set env → deploy. Add production redirect URL to Supabase Auth + Kakao console.
5. (Optional) 저녁 9시 알림 → Vercel Cron + web push / Kakao 알림톡.

## 10. Files in this bundle
- `README.md` (this file)
- `supabase_schema.sql`
- `Gratitude Diary.dc.html` — app design reference
- `Landing.dc.html` — landing design reference
