-- Sarana database schema.
-- Paste this whole file into Supabase > SQL Editor > New query, then press Run.
-- It is safe to run again: it only creates what is missing and replaces policies.
--
-- Tables:   profiles, pets, pet_contacts, reports, volunteers
-- Storage:  pet-photos bucket (public read, anyone can upload small images)
-- Security: Row Level Security (RLS) is ON for every table. Admins are rows in
--           profiles with role = 'admin'. After you sign up, make yourself admin with:
--             update public.profiles set role = 'admin' where id = '<your user id>';

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: one row per signed-in user (created automatically on sign-up)
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), 80)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- pets: one row per animal (its current state and location)
-- ---------------------------------------------------------------------------

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  animal_type text not null check (animal_type in ('dog', 'cat')),
  -- reported -> help_on_the_way -> safe -> adopted
  status text not null default 'reported'
    check (status in ('reported', 'help_on_the_way', 'safe', 'adopted')),
  -- urgent is a separate flag: injured, sick, puppies/kittens
  is_urgent boolean not null default false,
  -- condition chips from the report form, e.g. injured, sick, hungry, puppies, kittens, friendly
  conditions text[] not null default '{}' check (cardinality(conditions) <= 12),
  note text check (char_length(note) <= 1000),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  location_label text check (char_length(location_label) <= 200),
  -- paths inside the pet-photos bucket, e.g. 2026/10/<uuid>.webp (not full URLs)
  photo_paths text[] not null default '{}' check (cardinality(photo_paths) <= 5),
  -- null when the reporter was not logged in
  reporter_id uuid references public.profiles (id) on delete set null,
  -- admin moderation: hidden pets disappear for everyone except admins
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pets_created_at_idx on public.pets (created_at desc);
create index if not exists pets_status_idx on public.pets (status) where not is_hidden;
create index if not exists pets_location_idx on public.pets (lat, lng);

drop trigger if exists pets_set_updated_at on public.pets;
create trigger pets_set_updated_at
  before update on public.pets
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- pet_contacts: the reporter's optional phone/email. Never public.
-- ---------------------------------------------------------------------------

create table if not exists public.pet_contacts (
  pet_id uuid primary key references public.pets (id) on delete cascade,
  contact text not null check (char_length(contact) between 3 and 200),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- reports: the timeline of a pet (first report, status changes, updates, offers)
-- ---------------------------------------------------------------------------

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  kind text not null check (kind in (
    'reported',         -- first report (created automatically with the pet)
    'help_on_the_way',  -- status changes (volunteers and admins only)
    'safe',
    'adopted',
    'update',           -- a plain update with a note or photo
    'offer_help',       -- "I'll help"
    'offer_home'        -- "Give a home"
  )),
  help_type text check (help_type in ('food', 'vet', 'transport', 'foster')),
  note text check (char_length(note) <= 1000),
  photo_path text,
  created_at timestamptz not null default now()
);

create index if not exists reports_pet_idx on public.reports (pet_id, created_at);

-- Every new pet gets its first "reported" timeline entry.
create or replace function public.handle_new_pet()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.reports (pet_id, author_id, kind, note, photo_path)
  values (new.id, new.reporter_id, 'reported', new.note, new.photo_paths[1]);
  return new;
end;
$$;

drop trigger if exists on_pet_created on public.pets;
create trigger on_pet_created
  after insert on public.pets
  for each row execute function public.handle_new_pet();

-- A report moves the pet along the status flow.
create or replace function public.apply_report_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.kind in ('help_on_the_way', 'safe', 'adopted') then
    update public.pets set status = new.kind where id = new.pet_id;
  elsif new.kind = 'offer_help' then
    update public.pets set status = 'help_on_the_way'
    where id = new.pet_id and status = 'reported';
  end if;
  return new;
end;
$$;

drop trigger if exists on_report_created on public.reports;
create trigger on_report_created
  after insert on public.reports
  for each row execute function public.apply_report_status();

-- ---------------------------------------------------------------------------
-- volunteers: sign-up details. Private (own row + admins).
-- ---------------------------------------------------------------------------

create table if not exists public.volunteers (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 100),
  phone text not null check (char_length(phone) between 7 and 20),
  skills text[] not null
    check (cardinality(skills) >= 1 and skills <@ array['feeding', 'transport', 'foster', 'vet_care']),
  area text not null check (char_length(area) between 1 and 120),
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  radius_km integer not null default 10 check (radius_km between 1 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists volunteers_set_updated_at on public.volunteers;
create trigger volunteers_set_updated_at
  before update on public.volunteers
  for each row execute function public.set_updated_at();

-- Defined after the volunteers table, because SQL functions are checked when created.
create or replace function public.is_volunteer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.volunteers
    where user_id = (select auth.uid()) and is_active
  );
$$;

-- ---------------------------------------------------------------------------
-- Public numbers for the home page (counts only, no private data)
-- ---------------------------------------------------------------------------

create or replace function public.get_public_stats()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'reported',   (select count(*) from public.pets where not is_hidden),
    'helped',     (select count(*) from public.pets where not is_hidden and status in ('safe', 'adopted')),
    'adopted',    (select count(*) from public.pets where not is_hidden and status = 'adopted'),
    'volunteers', (select count(*) from public.volunteers where is_active)
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.pet_contacts enable row level security;
alter table public.reports enable row level security;
alter table public.volunteers enable row level security;

-- profiles: names are public (shown on updates); people edit only their own name
drop policy if exists "profiles are readable" on public.profiles;
create policy "profiles are readable" on public.profiles
  for select to anon, authenticated using (true);

drop policy if exists "edit own profile" on public.profiles;
create policy "edit own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- pets: anyone can see visible pets and report a new one (no login needed)
drop policy if exists "read visible pets" on public.pets;
create policy "read visible pets" on public.pets
  for select to anon, authenticated
  using (not is_hidden or public.is_admin());

drop policy if exists "anyone can report a pet" on public.pets;
create policy "anyone can report a pet" on public.pets
  for insert to anon, authenticated
  with check (
    status = 'reported'
    and not is_hidden
    and (reporter_id is null or reporter_id = (select auth.uid()))
  );

drop policy if exists "admins edit pets" on public.pets;
create policy "admins edit pets" on public.pets
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete pets" on public.pets;
create policy "admins delete pets" on public.pets
  for delete to authenticated using (public.is_admin());

-- pet_contacts: can be added only right after reporting; read by admin or the reporter
drop policy if exists "add contact to new pet" on public.pet_contacts;
create policy "add contact to new pet" on public.pet_contacts
  for insert to anon, authenticated
  with check (
    exists (
      select 1 from public.pets p
      where p.id = pet_id and p.created_at > now() - interval '10 minutes'
    )
  );

drop policy if exists "read contacts" on public.pet_contacts;
create policy "read contacts" on public.pet_contacts
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.pets p
      where p.id = pet_id and p.reporter_id = (select auth.uid())
    )
  );

-- reports: timeline is public for visible pets; logged-in people add to it
drop policy if exists "read reports of visible pets" on public.reports;
create policy "read reports of visible pets" on public.reports
  for select to anon, authenticated
  using (exists (select 1 from public.pets p where p.id = pet_id));

drop policy if exists "add reports" on public.reports;
create policy "add reports" on public.reports
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and kind <> 'reported'
    and (
      kind in ('update', 'offer_help', 'offer_home')
      or public.is_volunteer()
      or public.is_admin()
    )
  );

drop policy if exists "admins edit reports" on public.reports;
create policy "admins edit reports" on public.reports
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete reports" on public.reports;
create policy "admins delete reports" on public.reports
  for delete to authenticated using (public.is_admin());

-- volunteers: own row, plus admins can read
drop policy if exists "read own volunteer row" on public.volunteers;
create policy "read own volunteer row" on public.volunteers
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "sign up as volunteer" on public.volunteers;
create policy "sign up as volunteer" on public.volunteers
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "edit own volunteer row" on public.volunteers;
create policy "edit own volunteer row" on public.volunteers
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "delete own volunteer row" on public.volunteers;
create policy "delete own volunteer row" on public.volunteers
  for delete to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Table privileges (RLS above decides which rows; these decide which actions)
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant update (display_name) on public.profiles to authenticated; -- role can never be self-edited

grant select, insert on public.pets to anon, authenticated;
grant update, delete on public.pets to authenticated;

grant insert on public.pet_contacts to anon, authenticated;
grant select on public.pet_contacts to authenticated;

grant select on public.reports to anon, authenticated;
grant insert, update, delete on public.reports to authenticated;

grant select, insert, update, delete on public.volunteers to authenticated;

grant execute on function public.get_public_stats() to anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_new_pet() from public, anon, authenticated;
revoke execute on function public.apply_report_status() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Photo storage: public bucket, small images only (the browser compresses to ~200 KB)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pet-photos', 'pet-photos', true, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "anyone can upload pet photos" on storage.objects;
create policy "anyone can upload pet photos" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'pet-photos');

drop policy if exists "admins delete pet photos" on storage.objects;
create policy "admins delete pet photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'pet-photos' and public.is_admin());
