-- Berry Blossom v17: private office permissions and one-time executive activation.
-- Run this in the Supabase SQL editor (database owner), AFTER the existing schema/migrations.
-- Never commit actual invite codes to GitHub, or place codes in public client JS.
create extension if not exists pgcrypto;

create table if not exists public.office_security_staff (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  granted_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create table if not exists public.executive_invites (
  username text primary key,
  office_role text not null unique check(office_role in ('owner','director')),
  code_hash text not null,
  activated_user_id uuid unique references public.profiles(id) on delete set null,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  constraint executive_username_lower_check check(username=lower(trim(username)))
);
create table if not exists public.executive_activation_attempts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  failures integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.office_security_staff enable row level security;
alter table public.executive_invites enable row level security;
alter table public.executive_activation_attempts enable row level security;
revoke all on public.office_security_staff,public.executive_invites,public.executive_activation_attempts from anon,authenticated;
-- No direct table policies. Only controlled SECURITY DEFINER RPCs can read/mutate these records.

create or replace function public.my_office_access()
returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare my_role text;
begin
  if auth.uid() is null then return jsonb_build_object('security',false,'executive',null);end if;
  select e.office_role into my_role from public.executive_invites e
    join public.profiles p on p.id=auth.uid() and p.account_status='active'
    where e.activated_user_id=auth.uid() limit 1;
  return jsonb_build_object(
    'security', public.is_admin(auth.uid()) or exists(
      select 1 from public.office_security_staff s join public.profiles p on p.id=s.user_id
      where s.user_id=auth.uid() and p.account_status='active'
    ),
    'executive',my_role
  );
end $$;

create or replace function public.activate_executive_access(p_code text)
returns text language plpgsql security definer set search_path=public,pg_temp as $$
declare me record; invite record; attempt record;
begin
  if auth.uid() is null then raise exception 'Authentication required';end if;
  select id,lower(username::text) as username into me from public.profiles
   where id=auth.uid() and account_status='active';
  if not found then raise exception 'Active staff account required';end if;
  -- Lock the failure-counter row to serialize parallel attempts against this user.
  insert into public.executive_activation_attempts(user_id) values(auth.uid()) on conflict do nothing;
  select * into attempt from public.executive_activation_attempts where user_id=auth.uid() for update;
  if attempt.locked_until is not null and attempt.locked_until>now() then
    return ''; -- Returning rather than raising preserves the lockout transaction.
  end if;
  select * into invite from public.executive_invites where username=me.username for update;
  if invite.username is null or invite.activated_user_id is not null or invite.activated_at is not null or
     p_code is null or length(p_code)<16 or length(p_code)>72 or
     coalesce(crypt(p_code,invite.code_hash) = invite.code_hash,false) is not true then
    update public.executive_activation_attempts set
      failures=case when failures>=4 then 0 else failures+1 end,
      locked_until=case when failures>=4 then now()+interval '30 minutes' else null end,
      updated_at=now() where user_id=auth.uid();
    -- Deliberately generic; don't reveal whether a username is on the executive list.
    return ''; -- Don't raise: a database exception would roll back failure-count updates.
  end if;
  update public.executive_invites set activated_user_id=auth.uid(),activated_at=now() where username=invite.username;
  delete from public.executive_activation_attempts where user_id=auth.uid();
  return invite.office_role;
end $$;

create or replace function public.set_security_office_access(p_user_id uuid,p_allow boolean)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if not public.is_admin(auth.uid()) then raise exception 'Administrator permission required';end if;
  if not exists(select 1 from public.profiles where id=p_user_id and account_status='active') then
    raise exception 'Target must be an active staff member';
  end if;
  if p_allow then
    insert into public.office_security_staff(user_id,granted_by) values(p_user_id,auth.uid())
    on conflict(user_id) do nothing;
  else
    delete from public.office_security_staff where user_id=p_user_id;
  end if;
end $$;

revoke all on function public.my_office_access() from public,anon;
revoke all on function public.activate_executive_access(text) from public,anon;
revoke all on function public.set_security_office_access(uuid,boolean) from public,anon;
grant execute on function public.my_office_access() to authenticated;
grant execute on function public.activate_executive_access(text) to authenticated;
grant execute on function public.set_security_office_access(uuid,boolean) to authenticated;

-- PRIVATE, ONE-TIME SETUP: after both executives have created their normal accounts,
-- run the examples below ONLY in your Supabase SQL editor with real usernames and
-- separately chosen unique codes of 16+ random characters. Do not save the edited SQL to GitHub.
-- insert into public.executive_invites(username,office_role,code_hash)
-- values ('owner_username','owner',crypt('owner_private_code_16+_chars',gen_salt('bf',12)));
-- insert into public.executive_invites(username,office_role,code_hash)
-- values ('director_username','director',crypt('director_private_code_16+_chars',gen_salt('bf',12)));
