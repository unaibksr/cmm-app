-- ContactMerger Supabase Schema
-- Run this in your Supabase SQL editor

-- Create contacts table
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  nickname text,
  organization text,
  phones jsonb not null default '[]',
  emails jsonb not null default '[]',
  addresses jsonb not null default '[]',
  notes text,
  tags text[] not null default '{}',
  favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  synced_at timestamptz,
  deleted boolean not null default false
);

-- Enable RLS
alter table public.contacts enable row level security;

-- Create policy for public read/write (single-user app with anon key)
drop policy if exists "Allow all" on public.contacts;
create policy "Allow all" on public.contacts
  for all
  using (true)
  with check (true);

-- Create indexes
create index if not exists idx_contacts_user_id on public.contacts(user_id);
create index if not exists idx_contacts_updated_at on public.contacts(updated_at);
create index if not exists idx_contacts_deleted on public.contacts(deleted);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user (optional - for future multi-user support)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
