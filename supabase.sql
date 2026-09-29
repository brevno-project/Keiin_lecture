-- Paper Lane: table for orders from the homepage
-- Run in Supabase: SQL Editor -> New query -> paste -> Run

create table orders (
  id         bigint generated always as identity primary key,
  created_at timestamptz default now(),
  name       text not null,
  product    text not null,
  quantity   int  not null,
  message    text
);

-- Turn on Row Level Security and allow visitors to add and read orders
alter table orders enable row level security;

create policy "Anyone can add an order"
  on orders for insert to anon
  with check (true);

create policy "Anyone can read orders"
  on orders for select to anon
  using (true);
