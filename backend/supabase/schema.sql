create extension if not exists pgcrypto;
create extension if not exists citext;

create table if not exists public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  username citext unique not null,
  display_name text not null,
  dob date,
  role text not null default 'applicant' check (role in ('applicant','staff','admin')),
  account_status text not null default 'needs_application' check (account_status in ('needs_application','pending','declined','active')),
  department text,
  rank text not null default 'Applicant',
  maple_role text,
  unit text,
  is_head boolean not null default false,
  service_points integer not null default 0,
  merits integer not null default 0,
  certificate_count integer not null default 0,
  roblox_username text,
  roblox_user_id bigint,
  avatar_key text not null default 'nurse',
  frame_key text not null default 'berry-blossom',
  flare text not null default '',
  application_score integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_settings(
  id text primary key default 'global',
  theme text not null default 'standard' check(theme in ('standard','halloween','christmas')),
  cherry_game_id text,
  updated_at timestamptz not null default now()
);
insert into public.app_settings(id) values('global') on conflict do nothing;

create table if not exists public.staff_status(
  user_id uuid primary key references public.profiles(id) on delete cascade,
  on_shift boolean not null default false,
  activity text not null default 'Unavailable',
  updated_at timestamptz not null default now()
);

create table if not exists public.clock_sessions(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  clock_in timestamptz not null default now(),
  clock_out timestamptz,
  activity text
);

create table if not exists public.shifts(
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null default 1 check(capacity > 0),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.shift_members(
  shift_id uuid references public.shifts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  status text not null default 'applied' check(status in ('applied','assigned','declined')),
  created_at timestamptz not null default now(),
  primary key(shift_id,user_id)
);

create table if not exists public.trainings(
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null,
  starts_at timestamptz not null,
  capacity integer not null default 12 check(capacity > 0),
  location text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.training_attendance(
  training_id uuid references public.trainings(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  status text not null default 'booked' check(status in ('booked','attended','passed','needs_practice','did_not_attend')),
  signed_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  primary key(training_id,user_id)
);

create table if not exists public.events(
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at timestamptz not null,
  capacity integer not null default 20,
  scenario text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.event_rsvps(
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text,
  created_at timestamptz not null default now(),
  primary key(event_id,user_id)
);

create table if not exists public.announcements(
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  active boolean not null default true,
  published_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

create table if not exists public.applications(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  applicant_name text not null,
  department text not null,
  experience text not null,
  written_answer text not null,
  score integer not null check(score between 0 and 100),
  status text not null default 'pending' check(status in ('pending','approved','declined')),
  answers jsonb not null default '[]'::jsonb,
  management_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz
);

create table if not exists public.rp_patients(
  id uuid primary key default gen_random_uuid(),
  alias text not null,
  unit text not null,
  stage text not null default 'Waiting',
  scenario text not null,
  created_by uuid references public.profiles(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.hospital_requests(
  id uuid primary key default gen_random_uuid(),
  request_type text not null check(request_type in ('Laboratory','Imaging','Pharmacy')),
  patient_alias text not null,
  status text not null default 'Pending',
  notes text,
  created_by uuid references public.profiles(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.ems_calls(
  id uuid primary key default gen_random_uuid(),
  location text not null,
  scenario text not null,
  status text not null default 'Unassigned',
  assigned_to uuid references public.profiles(id),
  created_by uuid references public.profiles(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.emergency_codes(
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  label text not null,
  active boolean not null default false,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.rewards(
  id text primary key,
  name text not null,
  reward_type text not null,
  asset_path text not null,
  season text,
  points_required integer not null default 0
);

create table if not exists public.user_rewards(
  user_id uuid references public.profiles(id) on delete cascade,
  reward_id text references public.rewards(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key(user_id,reward_id)
);

-- New auth user -> applicant profile. The public app uses a synthetic internal email,
-- but the visible account remains username + password only.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path=public
as $$
begin
  insert into public.profiles(id,username,display_name,dob)
  values(
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'username',''),split_part(new.email,'@',1)),
    coalesce(nullif(new.raw_user_meta_data->>'display_name',''),split_part(new.email,'@',1)),
    nullif(new.raw_user_meta_data->>'dob','')::date
  );
  insert into public.staff_status(user_id,on_shift,activity) values(new.id,false,'Unavailable') on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public
as $$select exists(select 1 from public.profiles where id=uid and role='admin' and account_status='active')$$;

create or replace function public.is_active_staff(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public
as $$select exists(select 1 from public.profiles where id=uid and account_status='active' and role in ('staff','admin'))$$;

create or replace function public.can_manage_department(dep text, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public
as $$select public.is_admin(uid) or exists(select 1 from public.profiles where id=uid and account_status='active' and is_head=true and department=dep)$$;

create or replace function public.get_my_application_status()
returns table(id uuid,status text,department text,submitted_at timestamptz,score integer)
language sql stable security definer set search_path=public
as $$
  select a.id,a.status,a.department,a.submitted_at,
         case when a.status='approved' then a.score else null end
  from public.applications a
  where a.user_id=auth.uid()
  order by a.submitted_at desc limit 1
$$;

create or replace function public.update_my_profile(
  p_display_name text,p_dob date,p_roblox_username text,p_avatar_key text,p_frame_key text,p_flare text
) returns void language plpgsql security definer set search_path=public as $$
begin
  update public.profiles set display_name=coalesce(nullif(p_display_name,''),display_name),dob=p_dob,
    roblox_username=nullif(p_roblox_username,''),avatar_key=coalesce(nullif(p_avatar_key,''),avatar_key),
    frame_key=coalesce(nullif(p_frame_key,''),frame_key),flare=coalesce(p_flare,''),updated_at=now()
  where id=auth.uid();
end $$;

create or replace function public.clock_in(p_activity text default 'Available')
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_active_staff() then raise exception 'Active staff account required'; end if;
  if exists(select 1 from public.clock_sessions where user_id=auth.uid() and clock_out is null) then return; end if;
  insert into public.clock_sessions(user_id,activity) values(auth.uid(),p_activity);
  insert into public.staff_status(user_id,on_shift,activity,updated_at) values(auth.uid(),true,p_activity,now())
    on conflict(user_id) do update set on_shift=true,activity=excluded.activity,updated_at=now();
end $$;

create or replace function public.clock_out()
returns void language plpgsql security definer set search_path=public as $$
declare total_hours numeric;
begin
  update public.clock_sessions set clock_out=now() where user_id=auth.uid() and clock_out is null;
  insert into public.staff_status(user_id,on_shift,activity,updated_at) values(auth.uid(),false,'Unavailable',now())
    on conflict(user_id) do update set on_shift=false,activity='Unavailable',updated_at=now();
  if (select count(*) from public.clock_sessions where user_id=auth.uid() and clock_out is not null) >= 1 then
    insert into public.user_rewards(user_id,reward_id) values(auth.uid(),'first-shift') on conflict do nothing;
  end if;
  select coalesce(sum(extract(epoch from (clock_out-clock_in))/3600),0) into total_hours from public.clock_sessions where user_id=auth.uid() and clock_out is not null;
  if total_hours >= 10 then insert into public.user_rewards(user_id,reward_id) values(auth.uid(),'10-hours') on conflict do nothing; end if;
end $$;

create or replace function public.set_my_activity(p_activity text)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_active_staff() then raise exception 'Active staff account required'; end if;
  update public.staff_status set activity=p_activity,updated_at=now() where user_id=auth.uid();
end $$;

create or replace function public.apply_for_shift(p_shift_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_active_staff() then raise exception 'Active staff account required'; end if;
  if exists(select 1 from public.shift_members where shift_id=p_shift_id and user_id=auth.uid()) then
    delete from public.shift_members where shift_id=p_shift_id and user_id=auth.uid() and status='applied';
  else
    insert into public.shift_members(shift_id,user_id,status) values(p_shift_id,auth.uid(),'applied');
  end if;
end $$;

create or replace function public.toggle_training_booking(p_training_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_active_staff() then raise exception 'Active staff account required'; end if;
  if exists(select 1 from public.training_attendance where training_id=p_training_id and user_id=auth.uid()) then
    delete from public.training_attendance where training_id=p_training_id and user_id=auth.uid() and status='booked';
  else
    insert into public.training_attendance(training_id,user_id,status) values(p_training_id,auth.uid(),'booked');
  end if;
end $$;

create or replace function public.toggle_event_rsvp(p_event_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_active_staff() then raise exception 'Active staff account required'; end if;
  if exists(select 1 from public.event_rsvps where event_id=p_event_id and user_id=auth.uid()) then
    delete from public.event_rsvps where event_id=p_event_id and user_id=auth.uid();
  else
    insert into public.event_rsvps(event_id,user_id,role)
      select p_event_id,auth.uid(),coalesce(maple_role,'Staff') from public.profiles where id=auth.uid();
  end if;
end $$;

create or replace function public.set_global_theme(p_theme text)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'Administrator permission required'; end if;
  if p_theme not in ('standard','halloween','christmas') then raise exception 'Invalid theme'; end if;
  update public.app_settings set theme=p_theme,updated_at=now() where id='global';
end $$;

create or replace function public.set_cherry_server(p_game_id text)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'Administrator permission required'; end if;
  update public.app_settings set cherry_game_id=nullif(p_game_id,''),updated_at=now() where id='global';
end $$;

create or replace function public.review_application(p_application_id uuid,p_decision text,p_notes text default '')
returns void language plpgsql security definer set search_path=public as $$
declare app public.applications%rowtype;
begin
  if not public.is_admin() then raise exception 'Administrator permission required'; end if;
  if p_decision not in ('approved','declined') then raise exception 'Invalid decision'; end if;
  select * into app from public.applications where id=p_application_id for update;
  if app.id is null then raise exception 'Application not found'; end if;
  update public.applications set status=p_decision,management_notes=p_notes,reviewed_by=auth.uid(),reviewed_at=now() where id=p_application_id;
  if p_decision='approved' then
    update public.profiles set role='staff',account_status='active',department=app.department,rank='Staff Member',maple_role='Nurse',unit='General Ward',application_score=app.score,updated_at=now() where id=app.user_id;
  else
    update public.profiles set account_status='declined',updated_at=now() where id=app.user_id;
  end if;
end $$;

-- RLS
alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.staff_status enable row level security;
alter table public.clock_sessions enable row level security;
alter table public.shifts enable row level security;
alter table public.shift_members enable row level security;
alter table public.trainings enable row level security;
alter table public.training_attendance enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.announcements enable row level security;
alter table public.applications enable row level security;
alter table public.rp_patients enable row level security;
alter table public.hospital_requests enable row level security;
alter table public.ems_calls enable row level security;
alter table public.emergency_codes enable row level security;
alter table public.rewards enable row level security;
alter table public.user_rewards enable row level security;

-- Profiles: own profile or active staff directory.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using(id=auth.uid() or public.is_active_staff());

-- Settings are readable before/after login. Writes happen only through RPC.
drop policy if exists settings_select on public.app_settings;
create policy settings_select on public.app_settings for select to anon,authenticated using(true);

-- Active staff can read live operational state.
create policy staff_status_select on public.staff_status for select to authenticated using(public.is_active_staff());
create policy clock_self_select on public.clock_sessions for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy shifts_select on public.shifts for select to authenticated using(public.is_active_staff());
create policy shift_members_select on public.shift_members for select to authenticated using(public.is_active_staff());
create policy trainings_select on public.trainings for select to authenticated using(public.is_active_staff());
create policy training_attendance_select on public.training_attendance for select to authenticated using(public.is_active_staff());
create policy events_select on public.events for select to authenticated using(public.is_active_staff());
create policy event_rsvps_select on public.event_rsvps for select to authenticated using(public.is_active_staff());
create policy announcements_select on public.announcements for select to authenticated using(public.is_active_staff() and active=true);
create policy applications_admin_select on public.applications for select to authenticated using(public.is_admin());
create policy patients_select on public.rp_patients for select to authenticated using(public.is_active_staff());
create policy patients_insert on public.rp_patients for insert to authenticated with check(public.is_active_staff());
create policy patients_update on public.rp_patients for update to authenticated using(public.is_active_staff()) with check(public.is_active_staff());
create policy requests_select on public.hospital_requests for select to authenticated using(public.is_active_staff());
create policy requests_insert on public.hospital_requests for insert to authenticated with check(public.is_active_staff());
create policy requests_update on public.hospital_requests for update to authenticated using(public.is_active_staff()) with check(public.is_active_staff());
create policy ems_select on public.ems_calls for select to authenticated using(public.is_active_staff());
create policy ems_insert on public.ems_calls for insert to authenticated with check(public.is_active_staff());
create policy ems_update on public.ems_calls for update to authenticated using(public.is_active_staff()) with check(public.is_active_staff());
create policy codes_select on public.emergency_codes for select to authenticated using(public.is_active_staff());
create policy codes_update on public.emergency_codes for update to authenticated using(public.is_active_staff()) with check(public.is_active_staff());
create policy rewards_select on public.rewards for select to authenticated using(public.is_active_staff());
create policy user_rewards_select on public.user_rewards for select to authenticated using(user_id=auth.uid() or public.is_admin());

-- Management can create/update scheduling and training within their permitted department.
create policy shifts_manage_insert on public.shifts for insert to authenticated with check(public.can_manage_department(department));
create policy shifts_manage_update on public.shifts for update to authenticated using(public.can_manage_department(department)) with check(public.can_manage_department(department));
create policy trainings_manage_insert on public.trainings for insert to authenticated with check(public.is_admin() or department='Emergency Response' or public.can_manage_department(department));
create policy trainings_manage_update on public.trainings for update to authenticated using(public.is_admin() or department='Emergency Response' or public.can_manage_department(department));
create policy events_admin_insert on public.events for insert to authenticated with check(public.is_admin());
create policy events_admin_update on public.events for update to authenticated using(public.is_admin());
create policy announcements_admin_all on public.announcements for all to authenticated using(public.is_admin()) with check(public.is_admin());

-- Seed operational codes and reward catalogue.
insert into public.emergency_codes(code,label) values
 ('BLUE','Cardiac Arrest'),('RED','Fire Emergency'),('YELLOW','Missing Patient'),('WHITE','Violent Patient'),('PURPLE','Other Medical Emergency')
on conflict(code) do nothing;

insert into public.rewards(id,name,reward_type,asset_path,points_required) values
 ('first-shift','First Shift','badge','assets/badges/first-shift.webp',0),
 ('10-hours','10 Hours','badge','assets/badges/10-hours.webp',100),
 ('bls-passed','BLS Passed','badge','assets/badges/bls-passed.webp',0),
 ('emergency','Emergency','badge','assets/badges/emergency.webp',0),
 ('event','Event','badge','assets/badges/event.webp',0),
 ('staff-week','Staff of Week','badge','assets/badges/staff-week.webp',0),
 ('staff-month','Staff of Month','badge','assets/badges/staff-month.webp',0)
on conflict(id) do nothing;

-- Add tables to Supabase Realtime once. This block is idempotent.
do $$
declare t text;
begin
  foreach t in array array['app_settings','profiles','staff_status','shifts','shift_members','trainings','training_attendance','events','event_rsvps','announcements','rp_patients','hospital_requests','ems_calls','emergency_codes','applications']
  loop
    if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
      execute format('alter publication supabase_realtime add table public.%I',t);
    end if;
  end loop;
end $$;

-- Extended staff development and recognition features.
alter table public.app_settings add column if not exists coverage_targets jsonb not null default '{"A&E":5,"Paediatrics":4,"Maternity & Women’s Health":4,"Surgery":4,"Radiology":3}'::jsonb;

create table if not exists public.passport_signoffs(
  user_id uuid references public.profiles(id) on delete cascade,
  item text not null,
  signed_by uuid references public.profiles(id),
  signed_at timestamptz not null default now(),
  primary key(user_id,item)
);
create table if not exists public.competencies(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  department text,
  training_id uuid references public.trainings(id) on delete set null,
  signed_by uuid references public.profiles(id),
  signed_at timestamptz not null default now()
);
create table if not exists public.recognition(
  id text primary key default 'global',
  staff_week uuid references public.profiles(id),
  staff_month uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);
insert into public.recognition(id) values('global') on conflict do nothing;

alter table public.passport_signoffs enable row level security;
alter table public.competencies enable row level security;
alter table public.recognition enable row level security;
create policy passport_select on public.passport_signoffs for select to authenticated using(public.is_active_staff());
create policy competencies_select on public.competencies for select to authenticated using(public.is_active_staff());
create policy recognition_select on public.recognition for select to authenticated using(public.is_active_staff());
create policy training_attendance_manage on public.training_attendance for update to authenticated
  using(exists(select 1 from public.trainings t where t.id=training_id and (public.is_admin() or t.department='Emergency Response' or public.can_manage_department(t.department))))
  with check(exists(select 1 from public.trainings t where t.id=training_id and (public.is_admin() or t.department='Emergency Response' or public.can_manage_department(t.department))));
create policy shift_members_manage on public.shift_members for update to authenticated
  using(exists(select 1 from public.shifts s where s.id=shift_id and public.can_manage_department(s.department)))
  with check(exists(select 1 from public.shifts s where s.id=shift_id and public.can_manage_department(s.department)));

create or replace function public.set_coverage_targets(p_targets jsonb)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'Administrator permission required'; end if;
  update public.app_settings set coverage_targets=p_targets,updated_at=now() where id='global';
end $$;

create or replace function public.sign_passport(p_user_id uuid,p_item text)
returns void language plpgsql security definer set search_path=public as $$
declare dep text;
begin
  select department into dep from public.profiles where id=p_user_id;
  if not (public.is_admin() or public.can_manage_department(dep)) then raise exception 'Management permission required'; end if;
  insert into public.passport_signoffs(user_id,item,signed_by) values(p_user_id,p_item,auth.uid())
  on conflict(user_id,item) do update set signed_by=auth.uid(),signed_at=now();
end $$;

create or replace function public.set_training_result(p_training_id uuid,p_user_id uuid,p_status text)
returns void language plpgsql security definer set search_path=public as $$
declare tr public.trainings%rowtype;
begin
  select * into tr from public.trainings where id=p_training_id;
  if tr.id is null then raise exception 'Training not found'; end if;
  if not (public.is_admin() or tr.department='Emergency Response' or public.can_manage_department(tr.department)) then raise exception 'Management permission required'; end if;
  insert into public.training_attendance(training_id,user_id,status,signed_by) values(p_training_id,p_user_id,p_status,auth.uid())
  on conflict(training_id,user_id) do update set status=excluded.status,signed_by=auth.uid();
  if p_status='passed' then
    if not exists(select 1 from public.competencies where user_id=p_user_id and training_id=p_training_id) then
      insert into public.competencies(user_id,title,department,training_id,signed_by) values(p_user_id,tr.title,tr.department,p_training_id,auth.uid());
      update public.profiles set certificate_count=certificate_count+1,service_points=service_points+10 where id=p_user_id;
      if lower(tr.title) like '%basic life support%' or lower(tr.title) like '%bls%' then insert into public.user_rewards(user_id,reward_id) values(p_user_id,'bls-passed') on conflict do nothing; end if;
      if tr.department='Emergency Response' then insert into public.user_rewards(user_id,reward_id) values(p_user_id,'emergency') on conflict do nothing; end if;
    end if;
  end if;
end $$;

create or replace function public.manage_staff_record(p_user_id uuid,p_rank text,p_maple_role text,p_unit text,p_merits integer,p_is_head boolean)
returns void language plpgsql security definer set search_path=public as $$
declare dep text;
begin
  select department into dep from public.profiles where id=p_user_id;
  if not (public.is_admin() or public.can_manage_department(dep)) then raise exception 'Management permission required'; end if;
  update public.profiles set rank=p_rank,maple_role=p_maple_role,unit=p_unit,merits=greatest(0,p_merits),
    is_head=case when public.is_admin() then p_is_head else is_head end,updated_at=now() where id=p_user_id;
end $$;

create or replace function public.set_recognition(p_staff_week uuid,p_staff_month uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'Administrator permission required'; end if;
  update public.recognition set staff_week=p_staff_week,staff_month=p_staff_month,updated_at=now() where id='global';
  if p_staff_week is not null then insert into public.user_rewards(user_id,reward_id) values(p_staff_week,'staff-week') on conflict do nothing; end if;
  if p_staff_month is not null then insert into public.user_rewards(user_id,reward_id) values(p_staff_month,'staff-month') on conflict do nothing; end if;
end $$;

-- Add the new live tables to Realtime.
do $$
declare t text;
begin
  foreach t in array array['passport_signoffs','competencies','recognition'] loop
    if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
      execute format('alter publication supabase_realtime add table public.%I',t);
    end if;
  end loop;
end $$;
