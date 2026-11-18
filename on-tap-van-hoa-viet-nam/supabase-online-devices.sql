-- Live schema for the online device presence feature.
-- The public website sends heartbeat events to the online-heartbeat Edge Function.
-- The Edge Function uses the server-side service role key to write rows.
-- Visitors have no direct table write/read privileges.
-- Only users explicitly added to online_admins can read the device list.

create table if not exists public.online_devices (
  session_id uuid primary key,
  device_name text not null check (char_length(device_name) between 1 and 80),
  os_name text not null check (char_length(os_name) between 1 and 50),
  browser_name text not null check (char_length(browser_name) between 1 and 50),
  last_seen timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists online_devices_last_seen_idx
  on public.online_devices (last_seen desc);

create table if not exists public.online_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.online_devices enable row level security;
alter table public.online_admins enable row level security;

revoke all on table public.online_devices from anon, authenticated;
grant select on table public.online_devices to authenticated;
revoke all on table public.online_admins from anon, authenticated;
grant select on table public.online_admins to authenticated;

drop policy if exists "Only listed admins can read online devices" on public.online_devices;
create policy "Only listed admins can read online devices"
on public.online_devices for select to authenticated
using (exists (
  select 1 from public.online_admins admins
  where admins.user_id = (select auth.uid())
));

drop policy if exists "Admins can verify their own admin access" on public.online_admins;
create policy "Admins can verify their own admin access"
on public.online_admins for select to authenticated
using (user_id = (select auth.uid()));

-- Create an Auth user in Supabase Dashboard first, then grant admin access:
-- insert into public.online_admins (user_id)
-- values ('PASTE-USER-UID-HERE'::uuid)
-- on conflict (user_id) do nothing;
