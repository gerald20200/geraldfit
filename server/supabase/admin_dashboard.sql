-- Run after football_development.sql.
-- Existing accounts remain non-admin until explicitly promoted below.
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Archiving preserves historical progress logs and avoids deleting exercises in use.
alter table public.workouts
  add column if not exists is_published boolean not null default true;

create index if not exists workouts_published_idx on public.workouts(is_published);

-- Promote a trusted account by replacing the address, then run this statement manually:
-- update public.profiles set is_admin = true where lower(email) = lower('admin@example.com');

-- Confirm promotion without returning any authentication credentials:
-- select email, is_admin from public.profiles where lower(email) = lower('admin@example.com');