
-- ============ ENUMS ============
create type public.app_role as enum ('admin','kitchen');
create type public.order_status as enum ('new','preparing','ready','delivered','cancelled');

-- ============ ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz default now(),
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','kitchen'))
$$;

-- ============ TABLES (restaurant tables) ============
create table public.tables (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  seats int not null default 2,
  is_vip boolean not null default false,
  qr_token text not null unique default encode(gen_random_bytes(9),'hex'),
  active boolean not null default true,
  created_at timestamptz default now()
);

-- ============ DISHES ============
create table public.dishes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10,2) not null,
  category text not null,
  image text not null default '',
  calories int,
  prep_time int,
  badges text[] not null default '{}',
  available boolean not null default true,
  is_vip_only boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============ ORDERS ============
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  table_id uuid references public.tables(id) on delete set null,
  table_name text not null,
  status public.order_status not null default 'new',
  subtotal numeric(10,2) not null default 0,
  service numeric(10,2) not null default 0,
  tax numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  dish_id uuid references public.dishes(id) on delete set null,
  name text not null,
  price numeric(10,2) not null,
  qty int not null,
  notes text,
  image text default '',
  created_at timestamptz default now()
);

create index orders_status_idx on public.orders(status);
create index orders_created_at_idx on public.orders(created_at desc);
create index order_items_order_idx on public.order_items(order_id);

-- ============ RESERVATIONS ============
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  guests int not null,
  date date not null,
  time text not null,
  notes text,
  status text not null default 'pending',
  created_at timestamptz default now()
);

-- ============ TRIGGERS ============
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create trigger dishes_updated_at before update on public.dishes
  for each row execute function public.set_updated_at();

-- ============ RLS ============
alter table public.user_roles enable row level security;
alter table public.tables enable row level security;
alter table public.dishes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reservations enable row level security;

-- user_roles
create policy "user reads own roles" on public.user_roles
  for select using (auth.uid() = user_id);
create policy "admin manages roles" on public.user_roles
  for all using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- tables: public read (QR scanning is anonymous), admin manages
create policy "public reads tables" on public.tables
  for select using (true);
create policy "admin manages tables" on public.tables
  for insert with check (public.has_role(auth.uid(),'admin'));
create policy "admin updates tables" on public.tables
  for update using (public.has_role(auth.uid(),'admin'));
create policy "admin deletes tables" on public.tables
  for delete using (public.has_role(auth.uid(),'admin'));

-- dishes: public read (menu), admin manages
create policy "public reads dishes" on public.dishes
  for select using (true);
create policy "admin manages dishes ins" on public.dishes
  for insert with check (public.has_role(auth.uid(),'admin'));
create policy "admin manages dishes upd" on public.dishes
  for update using (public.has_role(auth.uid(),'admin'));
create policy "admin manages dishes del" on public.dishes
  for delete using (public.has_role(auth.uid(),'admin'));

-- orders: anyone may insert (anonymous customer via QR), staff reads/updates
create policy "anyone inserts order" on public.orders
  for insert with check (true);
create policy "staff reads orders" on public.orders
  for select using (public.is_staff(auth.uid()));
create policy "staff updates orders" on public.orders
  for update using (public.is_staff(auth.uid()));
create policy "admin deletes orders" on public.orders
  for delete using (public.has_role(auth.uid(),'admin'));

-- order_items: anyone inserts (with order), staff reads
create policy "anyone inserts order items" on public.order_items
  for insert with check (true);
create policy "staff reads order items" on public.order_items
  for select using (public.is_staff(auth.uid()));
create policy "admin deletes order items" on public.order_items
  for delete using (public.has_role(auth.uid(),'admin'));

-- reservations: public insert, admin manages
create policy "anyone inserts reservation" on public.reservations
  for insert with check (true);
create policy "admin reads reservations" on public.reservations
  for select using (public.has_role(auth.uid(),'admin'));
create policy "admin updates reservations" on public.reservations
  for update using (public.has_role(auth.uid(),'admin'));
create policy "admin deletes reservations" on public.reservations
  for delete using (public.has_role(auth.uid(),'admin'));

-- ============ REALTIME ============
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
