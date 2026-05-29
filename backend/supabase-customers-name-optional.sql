alter table if exists public.customers
  add column if not exists name text;

alter table if exists public.customers
  add column if not exists phone text;

alter table if exists public.customers
  alter column name drop not null;

alter table if exists public.customers disable row level security;
alter table if exists public.orders disable row level security;
alter table if exists public.feedback disable row level security;
