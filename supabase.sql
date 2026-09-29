-- Paper Lane: orders table
-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run

create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  customer_name text not null check (char_length(customer_name) between 1 and 80),
  email         text not null check (char_length(email) <= 120 and email like '%_@_%'),
  product       text not null check (char_length(product) between 1 and 60),
  quantity      int  not null check (quantity between 1 and 20),
  message       text check (char_length(message) <= 500)
);

-- Row Level Security: visitors may add orders and see the order feed
alter table public.orders enable row level security;

drop policy if exists "Anyone can place an order" on public.orders;
create policy "Anyone can place an order"
  on public.orders for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Anyone can see recent orders" on public.orders;
create policy "Anyone can see recent orders"
  on public.orders for select
  to anon, authenticated
  using (true);

-- Column-level access: the public key can never read e-mails or messages
revoke all on public.orders from anon, authenticated;
grant insert (customer_name, email, product, quantity, message) on public.orders to anon, authenticated;
grant select (id, created_at, customer_name, product, quantity)  on public.orders to anon, authenticated;
