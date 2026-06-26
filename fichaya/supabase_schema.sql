-- ============================================
-- FICHAYA - Supabase Schema
-- Ejecuta esto en el SQL Editor de Supabase
-- ============================================

-- Tabla de trabajadores
create table public.workers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  pin text not null,
  created_at timestamptz default now()
);

-- Tabla de fichajes
create table public.records (
  id uuid default gen_random_uuid() primary key,
  worker_id uuid references public.workers(id) on delete set null,
  worker_name text not null,
  check_in timestamptz not null default now(),
  check_out timestamptz,
  auto boolean default false,
  location_in jsonb,   -- { lat, lng, acc } o { error: 'no_permission' }
  location_out jsonb,
  created_at timestamptz default now()
);

-- Índices para consultas rápidas
create index on public.records(worker_id);
create index on public.records(check_in desc);
create index on public.records(check_out) where check_out is null;

-- Seguridad: habilitar RLS pero permitir acceso con anon key
-- (la app no tiene login de usuario, el PIN es la autenticación)
alter table public.workers enable row level security;
alter table public.records enable row level security;

create policy "allow_all_workers" on public.workers for all using (true) with check (true);
create policy "allow_all_records" on public.records for all using (true) with check (true);
