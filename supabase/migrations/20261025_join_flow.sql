-- Join flow (email first, then password), and login required for reporting.
-- Paste this whole file into Supabase > SQL Editor > New query, then press Run. Safe to run again.
-- (supabase/schema.sql already contains the same changes for a fresh database.)

-- 1) The Join page asks: does this email already have an account, and does it have a password?
--    The browser cannot see auth.users, so a small function answers with one word and nothing else:
--    'none' (new email), 'no_password' (account exists, no password yet) or 'password'.
create or replace function public.email_account_status(p_email text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when p_email is null or char_length(p_email) > 254 then 'none'
    else coalesce(
      (
        select case
          when u.encrypted_password is not null and u.encrypted_password <> '' then 'password'
          else 'no_password'
        end
        from auth.users u
        where lower(u.email) = lower(btrim(p_email)) and u.deleted_at is null
        limit 1
      ),
      'none'
    )
  end;
$$;

revoke all on function public.email_account_status(text) from public;
grant execute on function public.email_account_status(text) to anon, authenticated;

-- 2) Reporting needs a login (the website already asks for it before sending; now the database enforces it too).
drop policy if exists "anyone can report a pet" on public.pets;
drop policy if exists "logged-in people can report a pet" on public.pets;
create policy "logged-in people can report a pet" on public.pets
  for insert to authenticated
  with check (
    status = 'reported'
    and not is_hidden
    and reporter_id = (select auth.uid())
  );

drop policy if exists "add contact to new pet" on public.pet_contacts;
create policy "add contact to new pet" on public.pet_contacts
  for insert to authenticated
  with check (
    exists (
      select 1 from public.pets p
      where p.id = pet_id
        and p.reporter_id = (select auth.uid())
        and p.created_at > now() - interval '10 minutes'
    )
  );

drop policy if exists "anyone can upload pet photos" on storage.objects;
drop policy if exists "logged-in people can upload pet photos" on storage.objects;
create policy "logged-in people can upload pet photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pet-photos');

revoke insert on public.pets from anon;
revoke insert on public.pet_contacts from anon;
