-- ImStillHere - Initial Schema
-- Run this in your Supabase SQL Editor

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null default '',
  checkin_time time not null default '09:00:00',
  grace_period_minutes integer not null default 120,
  timezone text not null default 'America/New_York',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Emergency contacts
create table public.emergency_contacts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  email text not null,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Check-in log
create table public.checkins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  checked_in_at timestamptz not null default now(),
  method text not null default 'manual' -- 'manual', 'push', 'api'
);

-- Missed check-in alerts (audit trail)
create table public.missed_alerts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  alert_sent_at timestamptz not null default now(),
  contacts_notified jsonb not null default '[]'::jsonb
);

-- Indexes
create index idx_checkins_user_date on public.checkins (user_id, checked_in_at desc);
create index idx_emergency_contacts_user on public.emergency_contacts (user_id);
create index idx_missed_alerts_user on public.missed_alerts (user_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.checkins enable row level security;
alter table public.missed_alerts enable row level security;

-- Profiles: users can read/update their own
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Emergency contacts: users manage their own
create policy "Users can view own contacts" on public.emergency_contacts
  for select using (auth.uid() = user_id);
create policy "Users can insert own contacts" on public.emergency_contacts
  for insert with check (auth.uid() = user_id);
create policy "Users can update own contacts" on public.emergency_contacts
  for update using (auth.uid() = user_id);
create policy "Users can delete own contacts" on public.emergency_contacts
  for delete using (auth.uid() = user_id);

-- Checkins: users can view and create their own
create policy "Users can view own checkins" on public.checkins
  for select using (auth.uid() = user_id);
create policy "Users can insert own checkins" on public.checkins
  for insert with check (auth.uid() = user_id);

-- Missed alerts: users can view their own
create policy "Users can view own alerts" on public.missed_alerts
  for select using (auth.uid() = user_id);

-- Function: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function: get today's check-in status for a user
create or replace function public.get_today_checkin(p_user_id uuid, p_timezone text default 'America/New_York')
returns boolean as $$
begin
  return exists (
    select 1 from public.checkins
    where user_id = p_user_id
    and checked_in_at >= (now() at time zone p_timezone)::date::timestamptz
  );
end;
$$ language plpgsql security definer;

-- Function: get streak count
create or replace function public.get_streak(p_user_id uuid, p_timezone text default 'America/New_York')
returns integer as $$
declare
  streak integer := 0;
  check_date date;
  current_date_tz date;
begin
  current_date_tz := (now() at time zone p_timezone)::date;
  
  -- Check if checked in today
  if exists (
    select 1 from public.checkins
    where user_id = p_user_id
    and (checked_in_at at time zone p_timezone)::date = current_date_tz
  ) then
    streak := 1;
    check_date := current_date_tz - interval '1 day';
  else
    check_date := current_date_tz - interval '1 day';
  end if;
  
  -- Count consecutive days backwards
  loop
    if exists (
      select 1 from public.checkins
      where user_id = p_user_id
      and (checked_in_at at time zone p_timezone)::date = check_date
    ) then
      streak := streak + 1;
      check_date := check_date - interval '1 day';
    else
      exit;
    end if;
  end loop;
  
  return streak;
end;
$$ language plpgsql security definer;
