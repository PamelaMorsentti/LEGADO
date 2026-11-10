-- Supabase migration skeleton for LEGADO
-- This file is a starting point to preserve app functionality while replacing the legacy backend layer.

create extension if not exists "uuid-ossp";

-- ============================================
-- 1) Auth/profile
-- ============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);

create policy "Profiles are insertable by owner" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Profiles are updatable by owner" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ============================================
-- 2) Core content tables
-- ============================================
create table if not exists public.profile_info (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  section_key text,
  question text,
  answer text,
  order_index integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  description text,
  event_date date,
  location text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  description text,
  image_url text,
  storage_path text,
  album text,
  taken_at date,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  ingredients text,
  instructions text,
  notes text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  relation text,
  bio text,
  photo_url text,
  birth_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sender_name text not null,
  kind text not null default 'carta' check (kind in ('carta', 'audio')),
  message text,
  audio_url text,
  audio_storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  artist text,
  lyrics text,
  url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  description text,
  latitude double precision,
  longitude double precision,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.future_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  recipient text,
  message text,
  send_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.own_chapters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content text,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.own_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text,
  answer text,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chapter_covers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  description text,
  cover_image_url text,
  color_palette jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stickers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  emoji text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shared_books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  data_url text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 3) Generic RLS setup
-- ============================================
create or replace function public.is_owner(user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select auth.uid() = user_id;
$$;

-- apply RLS per table
alter table public.profile_info enable row level security;
alter table public.answers enable row level security;
alter table public.timeline_events enable row level security;
alter table public.photos enable row level security;
alter table public.recipes enable row level security;
alter table public.family_members enable row level security;
alter table public.family_messages enable row level security;
alter table public.songs enable row level security;
alter table public.places enable row level security;
alter table public.future_letters enable row level security;
alter table public.own_chapters enable row level security;
alter table public.own_questions enable row level security;
alter table public.chapter_covers enable row level security;
alter table public.stickers enable row level security;
alter table public.shared_books enable row level security;

-- owner-only policies (base pattern)
do $$
declare
  t text;
begin
  for t in (
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in (
        'profile_info', 'answers', 'timeline_events', 'photos', 'recipes', 'family_members',
        'family_messages', 'songs', 'places', 'future_letters', 'own_chapters', 'own_questions',
        'chapter_covers', 'stickers', 'shared_books'
      )
  )
  loop
    execute format('create policy "%s_select_own" on public.%I for select using (auth.uid() = user_id);', t, t);
    execute format('create policy "%s_insert_own" on public.%I for insert with check (auth.uid() = user_id);', t, t);
    execute format('create policy "%s_update_own" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);', t, t);
    execute format('create policy "%s_delete_own" on public.%I for delete using (auth.uid() = user_id);', t, t);
  end loop;
end $$;

-- ============================================
-- 4) Storage buckets for media files
-- ============================================
create policy "Allow public read on book public assets"
on storage.objects for select
using (bucket_id = 'book-files');

create policy "Allow owner upload to book-files"
on storage.objects for insert
with check (
  bucket_id = 'book-files'
  and auth.role() = 'authenticated'
);

create policy "Allow owner update to book-files"
on storage.objects for update
using (
  bucket_id = 'book-files'
  and auth.role() = 'authenticated'
)
with check (
  bucket_id = 'book-files'
  and auth.role() = 'authenticated'
);

create policy "Allow owner delete from book-files"
on storage.objects for delete
using (
  bucket_id = 'book-files'
  and auth.role() = 'authenticated'
);

-- Bucket creation should be done from the Supabase dashboard or via SQL only if your environment allows it.
-- Example:
-- insert into storage.buckets (id, name, public)
-- values ('book-files', 'book-files', true)
-- on conflict (id) do nothing;

-- ============================================
-- 5) Indexes used by the app
-- ============================================
create index if not exists idx_answers_user_section on public.answers(user_id, section_key);
create index if not exists idx_photos_user_album on public.photos(user_id, album);
create index if not exists idx_family_messages_user on public.family_messages(user_id);
create index if not exists idx_places_user on public.places(user_id);
create index if not exists idx_shared_books_user on public.shared_books(user_id);
create index if not exists idx_shared_books_token on public.shared_books(token);

-- End of schema skeleton.