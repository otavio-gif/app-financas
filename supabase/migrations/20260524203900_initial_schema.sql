-- ============================================================
-- Initial schema: categories, transactions
-- RLS, indexes, updated_at trigger, default-categories seed
-- ============================================================

-- shared trigger function for updated_at columns
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- categories
-- ============================================================
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  type        text not null check (type in ('income', 'expense')),
  color       text not null default '#94a3b8',
  icon        text,
  created_at  timestamptz not null default now()
);

create index categories_user_id_idx on public.categories(user_id);
create unique index categories_user_name_type_uk
  on public.categories(user_id, name, type);

alter table public.categories enable row level security;

create policy "categories_select_own"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "categories_insert_own"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "categories_update_own"
  on public.categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "categories_delete_own"
  on public.categories for delete
  using (auth.uid() = user_id);

-- ============================================================
-- transactions
-- ============================================================
create table public.transactions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  category_id   uuid references public.categories(id) on delete set null,
  type          text not null check (type in ('income', 'expense')),
  amount        numeric(12, 2) not null check (amount > 0),
  description   text,
  occurred_on   date not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index transactions_user_occurred_idx
  on public.transactions(user_id, occurred_on desc);
create index transactions_category_idx
  on public.transactions(category_id);

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

alter table public.transactions enable row level security;

create policy "transactions_select_own"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "transactions_insert_own"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "transactions_update_own"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "transactions_delete_own"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- ============================================================
-- seed default categories when a new user signs up
-- ============================================================
create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, type, color, icon) values
    (new.id, 'Alimentação',   'expense', '#ef4444', 'utensils'),
    (new.id, 'Transporte',    'expense', '#f97316', 'car'),
    (new.id, 'Moradia',       'expense', '#eab308', 'home'),
    (new.id, 'Saúde',         'expense', '#22c55e', 'heart-pulse'),
    (new.id, 'Lazer',         'expense', '#06b6d4', 'gamepad-2'),
    (new.id, 'Educação',      'expense', '#3b82f6', 'graduation-cap'),
    (new.id, 'Compras',       'expense', '#a855f7', 'shopping-bag'),
    (new.id, 'Outros',        'expense', '#94a3b8', 'circle-ellipsis'),
    (new.id, 'Salário',       'income',  '#10b981', 'wallet'),
    (new.id, 'Freelance',     'income',  '#14b8a6', 'briefcase'),
    (new.id, 'Investimentos', 'income',  '#0ea5e9', 'trending-up'),
    (new.id, 'Outros',        'income',  '#94a3b8', 'circle-ellipsis');
  return new;
end;
$$;

create trigger on_auth_user_created_seed_categories
  after insert on auth.users
  for each row execute function public.seed_default_categories();

-- one-time backfill for users that signed up before this migration
insert into public.categories (user_id, name, type, color, icon)
select u.id, c.name, c.type, c.color, c.icon
from auth.users u
cross join (values
  ('Alimentação',   'expense', '#ef4444', 'utensils'),
  ('Transporte',    'expense', '#f97316', 'car'),
  ('Moradia',       'expense', '#eab308', 'home'),
  ('Saúde',         'expense', '#22c55e', 'heart-pulse'),
  ('Lazer',         'expense', '#06b6d4', 'gamepad-2'),
  ('Educação',      'expense', '#3b82f6', 'graduation-cap'),
  ('Compras',       'expense', '#a855f7', 'shopping-bag'),
  ('Outros',        'expense', '#94a3b8', 'circle-ellipsis'),
  ('Salário',       'income',  '#10b981', 'wallet'),
  ('Freelance',     'income',  '#14b8a6', 'briefcase'),
  ('Investimentos', 'income',  '#0ea5e9', 'trending-up'),
  ('Outros',        'income',  '#94a3b8', 'circle-ellipsis')
) as c(name, type, color, icon)
on conflict (user_id, name, type) do nothing;
