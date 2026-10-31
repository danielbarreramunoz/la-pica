-- La Picá · 001_initial_schema.sql · Supabase + PostGIS + Realtime
create extension if not exists "pgcrypto";
create extension if not exists "postgis";

-- Tenants (picadas)
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location geography(Point,4326),
  created_at timestamptz not null default now()
);
create index tenants_location_gix on public.tenants using gist (location);

-- Catálogo maestro
create table public.dishes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index dishes_tenant_idx on public.dishes (tenant_id);

-- Menú del día (uno activo por tenant+fecha)
create table public.daily_menus (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  date date not null default current_date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, date)
);

-- Selector rápido: platos del día desde catálogo maestro
create table public.daily_menu_items (
  daily_menu_id uuid not null references public.daily_menus(id) on delete cascade,
  dish_id uuid not null references public.dishes(id) on delete restrict,
  stock int not null default 0 check (stock >= 0),
  primary key (daily_menu_id, dish_id)
);

-- Comandas: PENDING -> IN_PREPARATION -> READY -> SERVED -> PAID
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  status text not null default 'PENDING'
    check (status in ('PENDING','IN_PREPARATION','READY','SERVED','PAID')),
  table_number int,
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
create index orders_tenant_status_idx on public.orders (tenant_id, status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  dish_id uuid not null references public.dishes(id) on delete restrict,
  qty int not null check (qty > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0)
);
create index order_items_order_idx on public.order_items (order_id);

-- Realtime Mesero-Cocina-Caja
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;

-- Geolocalización: picadas cercanas (ej: radio 3000m)
-- select * from public.tenants
-- where ST_DWithin(location, ST_MakePoint(-70.66,-33.45)::geography, 3000);
