-- La Picá · 002_app_extensions.sql · columnas que usa el frontend + RPC cercanía
-- Aplicar DESPUÉS de 001 en Supabase SQL Editor.

-- tenants: datos ficha pública
alter table public.tenants add column if not exists address text not null default '';
alter table public.tenants add column if not exists lunch_hours text not null default '12:30 - 16:00';

-- dishes: campos del catálogo admin (001 solo tenía price)
alter table public.dishes add column if not exists description text not null default '';
alter table public.dishes add column if not exists category text not null default 'Fondo';
alter table public.dishes add column if not exists base_price numeric(10,2);
update public.dishes set base_price = price where base_price is null;
alter table public.dishes alter column base_price set not null;

-- order_items: notas por ítem (ej. acompañamiento)
alter table public.order_items add column if not exists notes text;

-- RPC cercanía PostGIS para restaurant.service.getNearbyRestaurants
-- Uso: select * from nearby_tenants(-33.36, -70.72, 3000);
create or replace function public.nearby_tenants(p_lat double precision, p_lng double precision, p_radius_m int)
returns table (id uuid, name text, address text, lunch_hours text, lat double precision, lng double precision, distance_m int)
language sql stable as $$
  select t.id, t.name, t.address, t.lunch_hours,
    st_y(t.location::geometry) as lat, st_x(t.location::geometry) as lng,
    st_distance(t.location, st_makepoint(p_lng, p_lat)::geography)::int as distance_m
  from public.tenants t
  where t.location is not null
    and st_dwithin(t.location, st_makepoint(p_lng, p_lat)::geography, p_radius_m)
  order by distance_m;
$$;
