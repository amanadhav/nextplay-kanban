-- NextPlay Kanban schema
-- Run this in the Supabase SQL editor.
-- Anonymous auth + RLS so each (anonymous) user only sees their own data.

-- ---------- Tables ----------

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'backlog'
    check (status in ('backlog', 'todo', 'in_progress', 'done')),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high')),
  due_date date,
  position double precision not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  created_at timestamptz not null default now()
);

create table if not exists public.task_labels (
  task_id uuid not null references public.tasks (id) on delete cascade,
  label_id uuid not null references public.labels (id) on delete cascade,
  primary key (task_id, label_id)
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists labels_user_id_idx on public.labels (user_id);

-- ---------- Row Level Security ----------

alter table public.tasks enable row level security;
alter table public.labels enable row level security;
alter table public.task_labels enable row level security;

-- tasks: owner-only access
create policy "tasks_select_own" on public.tasks
  for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks
  for delete using (auth.uid() = user_id);

-- labels: owner-only access
create policy "labels_select_own" on public.labels
  for select using (auth.uid() = user_id);
create policy "labels_insert_own" on public.labels
  for insert with check (auth.uid() = user_id);
create policy "labels_update_own" on public.labels
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "labels_delete_own" on public.labels
  for delete using (auth.uid() = user_id);

-- task_labels: access gated through the owning task
create policy "task_labels_select_own" on public.task_labels
  for select using (
    exists (select 1 from public.tasks t where t.id = task_id and t.user_id = auth.uid())
  );
create policy "task_labels_insert_own" on public.task_labels
  for insert with check (
    exists (select 1 from public.tasks t where t.id = task_id and t.user_id = auth.uid())
  );
create policy "task_labels_delete_own" on public.task_labels
  for delete using (
    exists (select 1 from public.tasks t where t.id = task_id and t.user_id = auth.uid())
  );
