-- Run this once in your Supabase project's SQL Editor.
-- Creates the table that stores each logged-in user's saved picks.

create table public.saved_picks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  type text not null,
  icon text,
  name text not null,
  ticker text,
  url text not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_id)
);

alter table public.saved_picks enable row level security;

create policy "Users can view their own saved picks"
  on public.saved_picks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved picks"
  on public.saved_picks for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own saved picks"
  on public.saved_picks for delete
  using (auth.uid() = user_id);
