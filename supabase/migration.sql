-- DealCircle V2 — Full Migration
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. TABLES
-- ============================================

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('seeker', 'investor', 'admin')),
  full_name text not null,
  email text not null,
  mobile text,
  city text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_note text,
  created_at timestamptz default now()
);

create table public.investor_profiles (
  id uuid references public.profiles on delete cascade primary key,
  investor_type text,
  corpus_band text,
  investment_interests text[],
  linkedin_url text
);

create table public.seeker_profiles (
  id uuid references public.profiles on delete cascade primary key,
  company_name text,
  designation text
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles,
  category text not null check (category in ('startup', 'sme', 'debt')),
  title text not null,
  show_company_name boolean default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'paused', 'closed')),
  admin_narrative text,
  fields jsonb default '{}'::jsonb,
  ticket_min bigint,
  ticket_max bigint,
  city text,
  sector text,
  nda_required boolean default false,
  published_at timestamptz,
  created_at timestamptz default now()
);

create table public.investor_interests (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references public.profiles not null,
  deal_id uuid references public.deals not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'in_discussion', 'converted', 'dropped')),
  admin_notes text,
  created_at timestamptz default now(),
  unique(investor_id, deal_id)
);

create table public.watchlist (
  investor_id uuid references public.profiles not null,
  deal_id uuid references public.deals not null,
  added_at timestamptz default now(),
  primary key (investor_id, deal_id)
);

-- ============================================
-- 2. RLS POLICIES
-- ============================================

alter table public.profiles enable row level security;
alter table public.investor_profiles enable row level security;
alter table public.seeker_profiles enable row level security;
alter table public.deals enable row level security;
alter table public.investor_interests enable row level security;
alter table public.watchlist enable row level security;

-- profiles: user reads/writes own row; admin reads all
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admin can read all profiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Admin can update all profiles"
  on public.profiles for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- investor_profiles
create policy "Users can read own investor profile"
  on public.investor_profiles for select
  using (auth.uid() = id);

create policy "Admin can read all investor profiles"
  on public.investor_profiles for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can insert own investor profile"
  on public.investor_profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own investor profile"
  on public.investor_profiles for update
  using (auth.uid() = id);

create policy "Admin can update all investor profiles"
  on public.investor_profiles for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- seeker_profiles
create policy "Users can read own seeker profile"
  on public.seeker_profiles for select
  using (auth.uid() = id);

create policy "Admin can read all seeker profiles"
  on public.seeker_profiles for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can insert own seeker profile"
  on public.seeker_profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own seeker profile"
  on public.seeker_profiles for update
  using (auth.uid() = id);

-- deals: investors read published; admin reads/writes all; seeker reads own
create policy "Investors can read published deals"
  on public.deals for select
  using (
    status = 'published'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'investor' and status = 'approved')
  );

create policy "Admin can do anything with deals"
  on public.deals for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Seeker can read own deals"
  on public.deals for select
  using (auth.uid() = created_by);

-- investor_interests: investor inserts own + reads own; admin reads/writes all
create policy "Investor can insert own interest"
  on public.investor_interests for insert
  with check (auth.uid() = investor_id);

create policy "Investor can read own interests"
  on public.investor_interests for select
  using (auth.uid() = investor_id);

create policy "Admin can do anything with interests"
  on public.investor_interests for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- watchlist: investor reads/writes own
create policy "Investor can manage own watchlist"
  on public.watchlist for all
  using (auth.uid() = investor_id);

-- ============================================
-- 3. STORAGE
-- ============================================

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict do nothing;

create policy "Authenticated users can upload documents"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "Users can read own documents"
  on storage.objects for select
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Admin can read all documents"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
