-- ============================================================
-- Thanks Log (감사일기) — Supabase schema
-- Postgres + Row Level Security. Run in Supabase SQL editor.
-- Auth is handled by Supabase Auth (Kakao OAuth provider).
-- auth.users.id (uuid) is the canonical user id.
-- ============================================================

-- 1) PROFILES ------------------------------------------------
-- One row per user, 1:1 with auth.users. Nickname pulled from
-- Kakao on first login but editable.
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  nickname     text not null default '',
  avatar_url   text,
  reminder_on  boolean not null default true,   -- 저녁 9시 알림
  created_at   timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nickname, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'nickname', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) ENTRIES -------------------------------------------------
-- One gratitude entry per user per day. items = 3 gratitude
-- lines; photos = ordered array of storage paths; mood 0-4.
create table public.entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  entry_date  date not null,
  items       text[] not null default '{}',      -- up to 3 lines
  photos      text[] not null default '{}',      -- storage object paths
  mood        smallint not null default 0,       -- 0..4 (Phosphor face index)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, entry_date)
);
create index entries_user_date_idx on public.entries (user_id, entry_date desc);

-- 3) GROUPS --------------------------------------------------
-- Shared gratitude circles (couple / family / friends).
create table public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  icon        text not null default 'ph-heart-straight',  -- Phosphor icon name
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table public.group_members (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete cascade, -- null = 초대 대기중 (invited_name만 있음)
  invited_name text,                                                 -- 앱 미사용 초대 표시용
  role        text not null default 'member',                        -- 'owner' | 'member'
  joined_at   timestamptz not null default now()
);

-- profiles.default_fridge_group_id references groups, so it's added here
-- (after groups exists) rather than in the profiles table above.
alter table public.profiles
  add column default_fridge_group_id uuid references public.groups(id) on delete set null; -- null = 내 냉장고
create index group_members_user_idx on public.group_members (user_id);
-- a real (linked) user can only appear once per group; invited-only placeholders (user_id is null) are unrestricted
create unique index group_members_group_user_uidx on public.group_members (group_id, user_id) where user_id is not null;

-- 4) REACTIONS: hearts + comments ---------------------------
-- Attach to a specific member's entry inside a group feed.
create table public.hearts (
  entry_id    uuid not null references public.entries(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (entry_id, user_id)
);

create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  entry_id    uuid not null references public.entries(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  body        text,                 -- text comment (null if sticker)
  sticker     text,                 -- sticker name e.g. 'placeholder:friend01' (null if text)
  created_at  timestamptz not null default now(),
  check (body is not null or sticker is not null)
);
create index comments_entry_idx on public.comments (entry_id, created_at);

-- 5) FRIENDS -------------------------------------------------
-- Lightweight friend list for the invite picker.
create table public.friends (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  friend_id   uuid references public.profiles(id) on delete cascade, -- null = 외부(카톡) 초대
  friend_name text not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, friend_name)
);

-- 6) FRIDGE ITEMS ---------------------------------------------
-- Personal pantry tracker (냉동실 / 냉장고 / 김치냉장고), or shared
-- with a '함께' group's members via group_id. Feeds the
-- menu-recommendation matcher in src/lib/recipes.ts.
create table public.fridge_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  group_id    uuid references public.groups(id) on delete cascade, -- null = 개인 냉장고
  zone        text not null check (zone in ('freezer', 'fridge', 'kimchi', 'room', 'seasoning')),
  name        text not null,
  created_at  timestamptz not null default now()
);
create index fridge_items_user_idx on public.fridge_items (user_id, zone, created_at);
create index fridge_items_group_idx on public.fridge_items (group_id, zone, created_at);

-- 7) SAVED RECIPES ---------------------------------------------
-- Bookmarked menu recommendations from the fridge matcher.
create table public.saved_recipes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  minutes     integer not null default 0,
  matched     text[] not null default '{}',
  missing     text[] not null default '{}',
  link        text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, name)
);
create index saved_recipes_user_idx on public.saved_recipes (user_id, created_at desc);

-- 8) SHOPPING LIST + MENU IDEAS ---------------------------------
create table public.shopping_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  done        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index shopping_items_user_idx on public.shopping_items (user_id, created_at);

create table public.menu_ideas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  note        text not null,
  created_at  timestamptz not null default now()
);
create index menu_ideas_user_idx on public.menu_ideas (user_id, created_at desc);

-- 9) PASSED RECIPES ----------------------------------------------
-- Dismissed menu recommendations, kept so "패스" sticks across reloads.
create table public.passed_recipes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, name)
);
create index passed_recipes_user_idx on public.passed_recipes (user_id, created_at desc);

-- 10) SCHEDULE ITEMS ----------------------------------------------
-- 기록 페이지의 공유 일정. 개인용(group_id null) 또는 특정 그룹
-- 전용 — fridge_items와 동일한 공유 모델(그룹이 다르면 서로 안 보임).
create table public.schedule_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  group_id    uuid references public.groups(id) on delete cascade,
  title       text not null,
  event_date  date not null,
  created_at  timestamptz not null default now()
);
create index schedule_items_user_idx on public.schedule_items (user_id, event_date);
create index schedule_items_group_idx on public.schedule_items (group_id, event_date);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.entries        enable row level security;
alter table public.groups         enable row level security;
alter table public.group_members  enable row level security;
alter table public.hearts         enable row level security;
alter table public.comments       enable row level security;
alter table public.friends        enable row level security;
alter table public.fridge_items   enable row level security;
alter table public.saved_recipes  enable row level security;
alter table public.shopping_items enable row level security;
alter table public.menu_ideas     enable row level security;
alter table public.passed_recipes enable row level security;
alter table public.schedule_items enable row level security;

-- helper: is the current user a member of a group?
create function public.is_group_member(gid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.group_members m
    where m.group_id = gid and m.user_id = auth.uid()
  );
$$;

-- helper: do I share ANY group with the owner of this entry?
create function public.shares_group_with(target uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.group_members a
    join public.group_members b on a.group_id = b.group_id
    where a.user_id = auth.uid() and b.user_id = target
  );
$$;

-- PROFILES: read own + group-mates; write own
create policy profiles_read on public.profiles for select
  using (id = auth.uid() or public.shares_group_with(id));
create policy profiles_update on public.profiles for update
  using (id = auth.uid());

-- ENTRIES: read own + group-mates'; write only own
create policy entries_read on public.entries for select
  using (user_id = auth.uid() or public.shares_group_with(user_id));
create policy entries_write on public.entries for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- GROUPS: members read; owner manages
create policy groups_read on public.groups for select
  using (public.is_group_member(id) or owner_id = auth.uid());
create policy groups_insert on public.groups for insert
  with check (owner_id = auth.uid());
create policy groups_update on public.groups for update
  using (owner_id = auth.uid());
create policy groups_delete on public.groups for delete
  using (owner_id = auth.uid());

-- GROUP_MEMBERS: members read; owner adds/removes
create policy gm_read on public.group_members for select
  using (public.is_group_member(group_id));
create policy gm_write on public.group_members for all
  using (exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid()))
  with check (exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid()));

-- HEARTS: group-mates read; each user toggles own
create policy hearts_read on public.hearts for select
  using (exists (select 1 from public.entries e where e.id = entry_id
                 and (e.user_id = auth.uid() or public.shares_group_with(e.user_id))));
create policy hearts_write on public.hearts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- COMMENTS: group-mates read; author writes/deletes own
create policy comments_read on public.comments for select
  using (exists (select 1 from public.entries e where e.id = entry_id
                 and (e.user_id = auth.uid() or public.shares_group_with(e.user_id))));
create policy comments_insert on public.comments for insert
  with check (user_id = auth.uid());
create policy comments_delete on public.comments for delete
  using (user_id = auth.uid());

-- FRIENDS: manage own list
create policy friends_all on public.friends for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- FRIDGE_ITEMS: own pantry, or shared with the linked group's members
create policy fridge_items_select on public.fridge_items for select
  using (user_id = auth.uid() or (group_id is not null and public.is_group_member(group_id)));
create policy fridge_items_insert on public.fridge_items for insert
  with check (user_id = auth.uid() and (group_id is null or public.is_group_member(group_id)));
create policy fridge_items_update on public.fridge_items for update
  using (user_id = auth.uid() or (group_id is not null and public.is_group_member(group_id)));
create policy fridge_items_delete on public.fridge_items for delete
  using (user_id = auth.uid() or (group_id is not null and public.is_group_member(group_id)));

-- SAVED_RECIPES: manage own bookmarks
create policy saved_recipes_all on public.saved_recipes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- SHOPPING_ITEMS: manage own list
create policy shopping_items_all on public.shopping_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- MENU_IDEAS: manage own notes
create policy menu_ideas_all on public.menu_ideas for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- PASSED_RECIPES: manage own dismissed list
create policy passed_recipes_all on public.passed_recipes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- SCHEDULE_ITEMS: own events, or shared with the linked group's members
create policy schedule_items_select on public.schedule_items for select
  using (user_id = auth.uid() or (group_id is not null and public.is_group_member(group_id)));
create policy schedule_items_insert on public.schedule_items for insert
  with check (user_id = auth.uid() and (group_id is null or public.is_group_member(group_id)));
create policy schedule_items_update on public.schedule_items for update
  using (user_id = auth.uid() or (group_id is not null and public.is_group_member(group_id)));
create policy schedule_items_delete on public.schedule_items for delete
  using (user_id = auth.uid() or (group_id is not null and public.is_group_member(group_id)));

-- ============================================================
-- STORAGE
-- Private bucket 'photos'. Object path convention:
--   {user_id}/{entry_date}/{uuid}.jpg
-- Stickers are static app assets shipped in /public/stickers,
-- NOT user uploads — store only the sticker *name* in comments.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

-- path's first folder segment is the owning user id
create policy photos_read on storage.objects for select
  using (
    bucket_id = 'photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.shares_group_with(((storage.foldername(name))[1])::uuid)
    )
  );

create policy photos_insert on storage.objects for insert
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy photos_update on storage.objects for update
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy photos_delete on storage.objects for delete
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
