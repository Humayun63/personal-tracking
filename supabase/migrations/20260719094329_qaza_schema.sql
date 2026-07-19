-- Qaza Tracker schema.
-- Total days owed is derived live from qaza_settings + qaza_exclusion_periods
-- (see lib/qaza/calculate.ts) rather than stored, so editing the bulugh date
-- later only changes the denominator, never the logged `done` counts.

create table if not exists public.qaza_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  bulugh_date date not null,
  qaza_end_date date not null,
  include_witr boolean not null default true,
  accent_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint qaza_end_after_bulugh check (qaza_end_date >= bulugh_date)
);

create table if not exists public.qaza_exclusion_periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  constraint exclusion_end_after_start check (end_date >= start_date)
);

create index if not exists qaza_exclusion_periods_user_id_idx
  on public.qaza_exclusion_periods (user_id);

create table if not exists public.qaza_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  prayer text not null check (prayer in ('fajr', 'zuhr', 'asr', 'maghrib', 'isha', 'witr')),
  log_date date not null,
  delta integer not null,
  created_at timestamptz not null default now()
);

create index if not exists qaza_logs_user_id_log_date_idx
  on public.qaza_logs (user_id, log_date);

create index if not exists qaza_logs_user_id_prayer_idx
  on public.qaza_logs (user_id, prayer);

alter table public.qaza_settings enable row level security;
alter table public.qaza_exclusion_periods enable row level security;
alter table public.qaza_logs enable row level security;

create policy "qaza_settings_owner" on public.qaza_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "qaza_exclusion_periods_owner" on public.qaza_exclusion_periods
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "qaza_logs_owner" on public.qaza_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger qaza_settings_set_updated_at
  before update on public.qaza_settings
  for each row execute function public.set_updated_at();
