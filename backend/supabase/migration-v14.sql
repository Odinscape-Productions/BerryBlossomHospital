-- Berry Blossom v14 profile customisation migration
alter table public.profiles add column if not exists banner_key text not null default 'blossom-courtyard';
alter table public.profiles add column if not exists bio text not null default '';
alter table public.profiles add column if not exists status_message text not null default '';

create or replace function public.update_my_profile_v14(
  p_display_name text,
  p_dob date,
  p_roblox_username text,
  p_avatar_key text,
  p_frame_key text,
  p_flare text,
  p_banner_key text,
  p_bio text,
  p_status_message text
) returns void language plpgsql security definer set search_path=public as $$
begin
  update public.profiles
  set display_name=coalesce(nullif(p_display_name,''),display_name),
      dob=p_dob,
      roblox_username=nullif(p_roblox_username,''),
      avatar_key=coalesce(nullif(p_avatar_key,''),avatar_key),
      frame_key=coalesce(nullif(p_frame_key,''),frame_key),
      flare=coalesce(p_flare,''),
      banner_key=coalesce(nullif(p_banner_key,''),banner_key),
      bio=coalesce(p_bio,''),
      status_message=coalesce(p_status_message,''),
      updated_at=now()
  where id=auth.uid();
end $$;
