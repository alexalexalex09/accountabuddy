-- Goals table: one row per user goal
create table public.goals (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text default '',
  timescale text default 'daily' check (timescale in ('daily', 'weekly', 'monthly')),
  reminder_policy text default 'default',
  created_at timestamptz default now(),
  responses jsonb default '[]'::jsonb
);

alter table public.goals enable row level security;

create policy "Users can view own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.goals for delete
  using (auth.uid() = user_id);
