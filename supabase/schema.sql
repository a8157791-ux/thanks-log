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
