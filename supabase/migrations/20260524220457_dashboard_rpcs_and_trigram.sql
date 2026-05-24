-- ============================================================
-- Aggregation RPCs (so the app doesn't pull whole tables to count
-- or sum) and a trigram index that backs the ILIKE description
-- search.
-- ============================================================

-- ---- pg_trgm + GIN index for ilike '%q%' on description ----
create extension if not exists pg_trgm;

create index transactions_description_trgm
  on public.transactions
  using gin (description gin_trgm_ops);

-- ---- usage count per category for the current user ----
-- security invoker → RLS applies, so each user only sees their own.
create or replace function public.category_usage_counts()
returns table (category_id uuid, count bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select t.category_id, count(*)::bigint
  from public.transactions t
  where t.category_id is not null
  group by t.category_id;
$$;

-- ---- monthly income vs expense totals for the last N months ----
create or replace function public.monthly_totals(p_months int)
returns table (month_start date, income numeric, expense numeric)
language sql
stable
security invoker
set search_path = ''
as $$
  with bucket as (
    select generate_series(
      date_trunc('month', current_date) - make_interval(months => p_months - 1),
      date_trunc('month', current_date),
      '1 month'::interval
    )::date as month_start
  )
  select
    b.month_start,
    coalesce(sum(t.amount) filter (where t.type = 'income'), 0)::numeric  as income,
    coalesce(sum(t.amount) filter (where t.type = 'expense'), 0)::numeric as expense
  from bucket b
  left join public.transactions t
    on date_trunc('month', t.occurred_on)::date = b.month_start
  group by b.month_start
  order by b.month_start;
$$;

-- ---- expense breakdown for the current month, by category ----
create or replace function public.current_month_expense_by_category()
returns table (category_id uuid, total numeric)
language sql
stable
security invoker
set search_path = ''
as $$
  select t.category_id, sum(t.amount)::numeric as total
  from public.transactions t
  where t.type = 'expense'
    and t.occurred_on >= date_trunc('month', current_date)::date
  group by t.category_id
  order by total desc;
$$;
