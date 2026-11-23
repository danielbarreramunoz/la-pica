-- La Picá · 003_inventory_and_orders.sql
-- Aplicar después de 001 y 002.

-- Puesto por comanda y datos de pre-pedido express.
alter table public.orders add column if not exists seat_number int;
alter table public.orders add column if not exists party_size int;
alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists customer_phone text;
alter table public.orders add column if not exists eta text;
alter table public.orders add column if not exists notes text;
alter table public.orders add column if not exists tip_amount numeric(10,2) not null default 0 check (tip_amount >= 0);
alter table public.orders add column if not exists payment_method text;

-- order_items conserva nombre y nota aunque cambie el catálogo.
alter table public.order_items add column if not exists dish_name text;
update public.order_items oi
set dish_name = d.name
from public.dishes d
where oi.dish_id = d.id and oi.dish_name is null;
alter table public.order_items alter column dish_name set default 'Producto';
alter table public.order_items alter column dish_name set not null;

-- Inventario: artículos unitarios se descuentan desde las ventas;
-- ingredientes se actualizan manualmente porque su consumo varía.
create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('UNIT', 'INGREDIENT')),
  quantity numeric(12,3) not null default 0 check (quantity >= 0),
  unit text not null default 'unidades',
  min_quantity numeric(12,3) not null default 0 check (min_quantity >= 0),
  dish_id uuid references public.dishes(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (kind <> 'UNIT' or dish_id is not null)
);
create index if not exists inventory_items_tenant_idx on public.inventory_items (tenant_id, kind, name);
create unique index if not exists inventory_items_dish_unique
  on public.inventory_items (tenant_id, dish_id)
  where kind = 'UNIT' and dish_id is not null;

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  delta numeric(12,3) not null check (delta <> 0),
  reason text not null,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists inventory_movements_item_created_idx
  on public.inventory_movements (inventory_item_id, created_at desc);

-- Habilita cambios de inventario en Supabase Realtime.
do $$
begin
  alter publication supabase_realtime add table public.inventory_items;
exception when duplicate_object then null;
end $$;
