-- ============================================================================
-- Exponent — Supabase Database Schema
-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)
--
-- First-time setup: run the entire file.
-- If tables already exist: run only the MIGRATION section at the bottom.
-- ============================================================================

-- 1. Profiles table (auto-created on signup)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Holdings table (user stock portfolio)
create table if not exists public.holdings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  symbol text not null,
  company_name text not null,
  quantity integer not null check (quantity > 0),
  buy_price numeric(12,2) not null check (buy_price > 0),
  sector text,
  notes text,
  added_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.holdings enable row level security;

create policy "Users can view own holdings"
  on public.holdings for select using (auth.uid() = user_id);

create policy "Users can insert own holdings"
  on public.holdings for insert with check (auth.uid() = user_id);

create policy "Users can update own holdings"
  on public.holdings for update using (auth.uid() = user_id);

create policy "Users can delete own holdings"
  on public.holdings for delete using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_holdings_updated_at
  before update on public.holdings
  for each row execute function public.update_updated_at_column();

-- 3. Watchlist table
create table if not exists public.watchlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  symbol text not null,
  company_name text not null,
  added_at timestamptz default now(),
  unique(user_id, symbol)
);

alter table public.watchlist enable row level security;

create policy "Users can view own watchlist"
  on public.watchlist for select using (auth.uid() = user_id);

create policy "Users can insert own watchlist"
  on public.watchlist for insert with check (auth.uid() = user_id);

create policy "Users can delete own watchlist"
  on public.watchlist for delete using (auth.uid() = user_id);

-- 4. Alerts table
create table if not exists public.alerts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  symbol text not null,
  condition text not null check (condition in ('above', 'below', 'pct_above', 'pct_below')),
  target_price numeric(12,2) not null,
  active boolean default true,
  triggered boolean default false,
  created_at timestamptz default now(),
  triggered_at timestamptz
);

-- condition supports: above / below (fixed price) and pct_above / pct_below (% move)
alter table public.alerts enable row level security;

create policy "Users can view own alerts"
  on public.alerts for select using (auth.uid() = user_id);

create policy "Users can insert own alerts"
  on public.alerts for insert with check (auth.uid() = user_id);

create policy "Users can update own alerts"
  on public.alerts for update using (auth.uid() = user_id);

create policy "Users can delete own alerts"
  on public.alerts for delete using (auth.uid() = user_id);

-- ============================================================================
-- Done! All tables created with Row Level Security.
-- ============================================================================

-- ============================================================================
-- MIGRATIONS — run these if tables already exist from a previous setup
-- ============================================================================

-- Allow percentage-based alert conditions (pct_above / pct_below)
-- Skip if running the full schema above for the first time.
alter table public.alerts
  drop constraint if exists alerts_condition_check;

alter table public.alerts
  add constraint alerts_condition_check
  check (condition in ('above', 'below', 'pct_above', 'pct_below'));

-- ============================================================================
-- MongoDB collections (paper trading & leaderboard)
-- These are managed automatically by the app — no manual setup required.
-- Just add MONGODB_URI to your .env.local (see .env.example).
--
--  Collection: paper_trades
--    { user_id, username, balance, usedMargin, netWorth,
--      orders: [...], holdings: [...], updatedAt }
--    Indexed on: user_id (unique), netWorth (for leaderboard sort)
-- ============================================================================
