-- ============================================================
-- Migration: friend_invites (링크로 친구 추가)
-- 설정 화면에서 만든 1회용 초대 링크를 상대가 열어 카카오 로그인 후
-- 수락하면, 이름만 있던 가짜 친구가 아니라 실제 프로필로 서로의
-- friends 목록에 연결된다.
-- Run this once in the Supabase SQL editor.
-- ============================================================

create table public.friend_invites (
  id            uuid primary key default gen_random_uuid(),
  inviter_id    uuid not null references public.profiles(id) on delete cascade,
  inviter_name  text not null,               -- 생성 시점 닉네임 스냅샷 (수락 전 미리보기용, RLS 없이 노출)
  token         text not null unique,
  status        text not null default 'pending', -- 'pending' | 'accepted' | 'revoked'
  accepted_by   uuid references public.profiles(id) on delete set null,
  accepted_at   timestamptz,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null default (now() + interval '14 days')
);
create index friend_invites_inviter_idx on public.friend_invites (inviter_id, created_at desc);

alter table public.friend_invites enable row level security;

-- 로그인 전 방문자도 pending/미만료 초대는 미리보기(초대한 사람 이름)를 볼 수 있어야
-- 하고, 만든 사람은 상태와 무관하게 자기 초대는 관리(취소)할 수 있어야 한다.
create policy friend_invites_select on public.friend_invites for select
  using ((status = 'pending' and expires_at > now()) or inviter_id = auth.uid());

create policy friend_invites_insert on public.friend_invites for insert
  with check (inviter_id = auth.uid());

-- 초대 취소(상태 변경)는 만든 사람만. 수락 자체는 아래 accept_friend_invite()로
-- 처리한다 — 수락하는 사람은 inviter가 아니라서 이 정책을 통과할 수 없기 때문.
create policy friend_invites_update on public.friend_invites for update
  using (inviter_id = auth.uid());

-- 토큰으로 초대 미리보기 조회. 만료됐으면 아무 행도 반환하지 않아 UI가
-- "만료됨" 상태를 보여줄 수 있게 한다.
create or replace function public.get_invite_preview(p_token text)
returns table(inviter_id uuid, inviter_name text, status text)
language sql security definer stable set search_path = public as $$
  select inviter_id, inviter_name, status
  from public.friend_invites
  where token = p_token and expires_at > now();
$$;

-- 초대 수락: 양쪽 모두를 진짜 friends 행으로 연결(이름만 있던 자리는 덮어씀)하고
-- 초대를 사용 처리한다. security definer인 이유 — 수락하는 사람은 상대방(inviter)
-- 소유의 friends 행도 함께 써야 하는데, friends_all 정책(user_id = auth.uid())은
-- 본인 행만 허용하기 때문에 일반 권한으로는 불가능하다. 이 함수 안에서 유효성을
-- 전부 검증하므로 안전하다.
create or replace function public.accept_friend_invite(p_token text)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_invite public.friend_invites%rowtype;
  v_me uuid := auth.uid();
  v_my_name text;
begin
  if v_me is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_invite from public.friend_invites
  where token = p_token and status = 'pending' and expires_at > now()
  for update;

  if not found then
    raise exception 'invite_invalid';
  end if;

  if v_invite.inviter_id = v_me then
    raise exception 'invite_self';
  end if;

  select nickname into v_my_name from public.profiles where id = v_me;
  v_my_name := coalesce(nullif(v_my_name, ''), '친구');

  insert into public.friends (user_id, friend_id, friend_name)
  values (v_invite.inviter_id, v_me, v_my_name)
  on conflict (user_id, friend_name) do update set friend_id = excluded.friend_id;

  insert into public.friends (user_id, friend_id, friend_name)
  values (v_me, v_invite.inviter_id, v_invite.inviter_name)
  on conflict (user_id, friend_name) do update set friend_id = excluded.friend_id;

  update public.friend_invites
  set status = 'accepted', accepted_by = v_me, accepted_at = now()
  where id = v_invite.id;

  return v_invite.inviter_name;
end; $$;

grant execute on function public.get_invite_preview(text) to anon, authenticated;
grant execute on function public.accept_friend_invite(text) to authenticated;
