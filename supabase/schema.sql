create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text,
  username text unique,
  photo_url text,
  active_room_code varchar(4),
  created_at timestamptz not null default timezone('utc', now()),
  username_updated_at timestamptz
);

create table if not exists public.profile_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  games_played integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  level integer not null default 1,
  xp integer not null default 0,
  current_streak integer not null default 0,
  best_streak integer not null default 0
);

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_uid uuid not null references public.profiles (id) on delete cascade,
  to_uid uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default timezone('utc', now()),
  constraint friend_requests_no_self_request check (from_uid <> to_uid)
);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid not null references public.profiles (id) on delete cascade,
  user2_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint friendships_no_self_friendship check (user1_id <> user2_id)
);

create table if not exists public.blocked_users (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint blocked_users_no_self_block check (blocker_id <> blocked_id)
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code varchar(4) not null unique,
  host_uid uuid not null references public.profiles (id) on delete cascade,
  mode text,
  genre text,
  rounds integer not null default 5,
  players_max integer not null default 8,
  status text not null default 'waiting',
  created_at timestamptz not null default timezone('utc', now()),
  constraint rooms_code_length check (char_length(code) = 4)
);

create table if not exists public.room_players (
  id uuid primary key default gen_random_uuid(),
  room_code varchar(4) not null references public.rooms (code) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  score integer not null default 0,
  is_host boolean not null default false,
  joined_at timestamptz not null default timezone('utc', now()),
  constraint room_players_unique_room_user unique (room_code, user_id)
);

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  preview_url text,
  spotify_id text unique,
  genre text,
  decade text,
  difficulty text
);

create unique index if not exists friendships_pair_idx
  on public.friendships (least(user1_id, user2_id), greatest(user1_id, user2_id));

create unique index if not exists blocked_users_pair_idx
  on public.blocked_users (blocker_id, blocked_id);

alter table public.profiles enable row level security;
alter table public.profile_stats enable row level security;
alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;
alter table public.blocked_users enable row level security;
alter table public.rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.songs enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles
  for delete
  using (auth.uid() = id);

create policy "profile_stats_select_own"
  on public.profile_stats
  for select
  using (auth.uid() = user_id);

create policy "profile_stats_insert_own"
  on public.profile_stats
  for insert
  with check (auth.uid() = user_id);

create policy "profile_stats_update_own"
  on public.profile_stats
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "profile_stats_delete_own"
  on public.profile_stats
  for delete
  using (auth.uid() = user_id);

create policy "friend_requests_select_related"
  on public.friend_requests
  for select
  using (auth.uid() = from_uid or auth.uid() = to_uid);

create policy "friend_requests_insert_sender"
  on public.friend_requests
  for insert
  with check (auth.uid() = from_uid);

create policy "friend_requests_update_related"
  on public.friend_requests
  for update
  using (auth.uid() = from_uid or auth.uid() = to_uid)
  with check (auth.uid() = from_uid or auth.uid() = to_uid);

create policy "friend_requests_delete_related"
  on public.friend_requests
  for delete
  using (auth.uid() = from_uid or auth.uid() = to_uid);

create policy "friendships_select_related"
  on public.friendships
  for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "friendships_insert_related"
  on public.friendships
  for insert
  with check (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "friendships_update_related"
  on public.friendships
  for update
  using (auth.uid() = user1_id or auth.uid() = user2_id)
  with check (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "friendships_delete_related"
  on public.friendships
  for delete
  using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "blocked_users_select_blocker"
  on public.blocked_users
  for select
  using (auth.uid() = blocker_id);

create policy "blocked_users_insert_blocker"
  on public.blocked_users
  for insert
  with check (auth.uid() = blocker_id);

create policy "blocked_users_update_blocker"
  on public.blocked_users
  for update
  using (auth.uid() = blocker_id)
  with check (auth.uid() = blocker_id);

create policy "blocked_users_delete_blocker"
  on public.blocked_users
  for delete
  using (auth.uid() = blocker_id);

create policy "rooms_select_host"
  on public.rooms
  for select
  using (auth.uid() = host_uid);

create policy "rooms_insert_host"
  on public.rooms
  for insert
  with check (auth.uid() = host_uid);

create policy "rooms_update_host"
  on public.rooms
  for update
  using (auth.uid() = host_uid)
  with check (auth.uid() = host_uid);

create policy "rooms_delete_host"
  on public.rooms
  for delete
  using (auth.uid() = host_uid);

create policy "room_players_select_own"
  on public.room_players
  for select
  using (auth.uid() = user_id);

create policy "room_players_insert_own"
  on public.room_players
  for insert
  with check (auth.uid() = user_id);

create policy "room_players_update_own"
  on public.room_players
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "room_players_delete_own"
  on public.room_players
  for delete
  using (auth.uid() = user_id);

create policy "songs_select_authenticated"
  on public.songs
  for select
  using (auth.role() = 'authenticated');
