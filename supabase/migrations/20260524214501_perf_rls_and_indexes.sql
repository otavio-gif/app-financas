-- ============================================================
-- Performance: wrap auth.uid() in (select ...) so it's evaluated
-- once per statement, scope policies to authenticated, drop a
-- redundant index, and replace the transactions FK index with a
-- composite that also covers the RLS user_id filter.
-- ============================================================

-- ---- categories policies ----
drop policy "categories_select_own" on public.categories;
drop policy "categories_insert_own" on public.categories;
drop policy "categories_update_own" on public.categories;
drop policy "categories_delete_own" on public.categories;

create policy "categories_select_own"
  on public.categories for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "categories_insert_own"
  on public.categories for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "categories_update_own"
  on public.categories for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "categories_delete_own"
  on public.categories for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---- transactions policies ----
drop policy "transactions_select_own" on public.transactions;
drop policy "transactions_insert_own" on public.transactions;
drop policy "transactions_update_own" on public.transactions;
drop policy "transactions_delete_own" on public.transactions;

create policy "transactions_select_own"
  on public.transactions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "transactions_insert_own"
  on public.transactions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "transactions_update_own"
  on public.transactions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "transactions_delete_own"
  on public.transactions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---- indexes ----
-- The composite unique (user_id, name, type) already covers user_id queries,
-- so the standalone index is dead weight.
drop index if exists public.categories_user_id_idx;

-- Replace single-column category FK index with composite that also
-- supports the RLS user_id filter when listing/filtering by category.
drop index if exists public.transactions_category_idx;
create index transactions_user_category_idx
  on public.transactions (user_id, category_id);
