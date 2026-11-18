-- IF ONLY? No: Ôn tập Văn hóa Việt Nam - online device presence
-- Run this whole file in Supabase Dashboard > SQL Editor.
-- Visitors are anonymous-authenticated and can manage only their own session rows.
-- Only users explicitly inserted into online_admins can read all online devices.

create table if not exists public.online_devices (
  session_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  device_name text not null,
  os_name text not null,
  browser_name text not null,
  last_seen timestamptz not null default now()
);

create index if not exists online_devices_last_seen_idx
  on public.online_devices (last_seen desc);

create index if not exists online_devices_user_id_idx
  on public.online_devices (user_id);

create table if not exists public.online_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.online_devices enable row level security;
alter table public.online_admins enable row level security;

grant select, insert, update, delete on public.online_devices to authenticated;
grant select on public.online_admins to authenticated;

drop policy if exists "Visitors can insert their own online session" on public.online_devices;
create policy "Visitors can insert their own online session"
on public.online_devices
for insert to authenticated
with check (
  auth.uid() = user_id
  and coalesce((auth.jwt()->>'is_anonymous')::boolean, false) = true
);

drop policy if exists "Visitors can read their own online session" on public.online_devices;
create policy "Visitors can read their own online session"
on public.online_devices
for select to authenticated
using (
  auth.uid() = user_id
  and coalesce((auth.jwt()->>'is_anonymous')::boolean, false) = true
);

drop policy if exists "Visitors can update their own online session" on public.online_devices;
create policy "Visitors can update their own online session"
on public.online_devices
for update to authenticated
using (
  auth.uid() = user_id
  and coalesce((auth.jwt()->>'is_anonymous')::boolean, false) = true
)
with check (
  auth.uid() = user_id
  and coalesce((auth.jwt()->>'is_anonymous')::boolean, false) = true
);

drop policy if exists "Visitors can delete their own old sessions" on public.online_devices;
create policy "Visitors can delete their own old sessions"
on public.online_devices
for delete to authenticated
using (
  auth.uid() = user_id
  and coalesce((auth.jwt()->>'is_anonymous')::boolean, false) = true
);

drop policy if exists "Only listed admins can read online devices" on public.online_devices;
create policy "Only listed admins can read online devices"
on public.online_devices
for select to authenticated
using (
  exists (
    select 1
    from public.online_admins admins
    where admins.user_id = auth.uid()
  )
);

drop policy if exists "Admins can verify their own admin access" on public.online_admins;
create policy "Admins can verify their own admin access"
on public.online_admins
for select to authenticated
using (user_id = auth.uid());

-- AFTER creating your admin user in Authentication > Users,
-- replace the email below with that account's email and run:
-- insert into public.online_admins (user_id)
-- select id from auth.users where email = 'your-admin@email.com'
-- on conflict (user_id) do nothing;
