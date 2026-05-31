-- QASR Supabase schema

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  role text not null check (role in ('admin', 'manager')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'admin')
  )
  on conflict (id) do update
    set email = excluded.email,
        role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

alter table public.users enable row level security;

create index if not exists users_role_idx on public.users (role);

create policy "Users can view their own profile"
on public.users
for select
using (auth.uid() = id);

create policy "Managers can read all users"
on public.users
for select
using (
  exists (
    select 1
    from public.users as viewer
    where viewer.id = auth.uid()
      and viewer.role = 'manager'
  )
);

create policy "Managers can insert users"
on public.users
for insert
with check (
  exists (
    select 1
    from public.users as viewer
    where viewer.id = auth.uid()
      and viewer.role = 'manager'
  )
);

create policy "Managers can update users"
on public.users
for update
using (
  exists (
    select 1
    from public.users as viewer
    where viewer.id = auth.uid()
      and viewer.role = 'manager'
  )
);

create policy "Managers can delete users"
on public.users
for delete
using (
  exists (
    select 1
    from public.users as viewer
    where viewer.id = auth.uid()
      and viewer.role = 'manager'
  )
);

-- Optional contact form table
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "Anyone can insert contact messages"
on public.contact_messages
for insert
with check (true);
