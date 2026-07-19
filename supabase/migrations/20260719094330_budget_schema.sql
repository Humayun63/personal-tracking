-- Budget module schema.
-- Months are independent snapshots (per the mockup): a category's budget for
-- a given month lives on budget_month_categories, not on the category itself,
-- so "copy from previous month" is a literal row copy and later edits to one
-- month never affect another.

create table if not exists public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists budget_categories_user_id_idx
  on public.budget_categories (user_id);

create table if not exists public.budget_months (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

create table if not exists public.budget_month_categories (
  id uuid primary key default gen_random_uuid(),
  month_id uuid not null references public.budget_months (id) on delete cascade,
  category_id uuid not null references public.budget_categories (id) on delete cascade,
  budget numeric(12, 2) not null default 0,
  sort_order integer not null default 0,
  unique (month_id, category_id)
);

create index if not exists budget_month_categories_month_id_idx
  on public.budget_month_categories (month_id);

create table if not exists public.budget_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month_id uuid not null references public.budget_months (id) on delete cascade,
  category_id uuid not null references public.budget_categories (id) on delete restrict,
  description text not null,
  amount numeric(12, 2) not null check (amount > 0),
  expense_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists budget_expenses_month_id_idx
  on public.budget_expenses (month_id);

create index if not exists budget_expenses_category_id_idx
  on public.budget_expenses (category_id);

alter table public.budget_categories enable row level security;
alter table public.budget_months enable row level security;
alter table public.budget_month_categories enable row level security;
alter table public.budget_expenses enable row level security;

create policy "budget_categories_owner" on public.budget_categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "budget_months_owner" on public.budget_months
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "budget_expenses_owner" on public.budget_expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- budget_month_categories has no user_id of its own; authorize via its parent month.
create policy "budget_month_categories_owner" on public.budget_month_categories
  for all using (
    exists (
      select 1 from public.budget_months m
      where m.id = budget_month_categories.month_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.budget_months m
      where m.id = budget_month_categories.month_id and m.user_id = auth.uid()
    )
  );
