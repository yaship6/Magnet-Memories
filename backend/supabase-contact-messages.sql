create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_phone text not null,
  request_type text not null,
  message text not null,
  status text not null default 'new'
);

alter table if exists public.contact_messages disable row level security;
