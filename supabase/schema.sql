-- Supabase schema for room manager

-- members table (room members)
create table if not exists members (
  id bigserial primary key,
  name text not null,
  created_at timestamptz default now()
);

-- fund transactions
create table if not exists fund_transactions (
  id bigserial primary key,
  amount numeric not null,
  note text,
  member_name text,
  created_at timestamptz default now()
);

alter table if exists fund_transactions enable row level security;

drop policy if exists fund_select on public.fund_transactions;
drop policy if exists fund_insert on public.fund_transactions;

create policy fund_select on public.fund_transactions
for select using (true);

create policy fund_insert on public.fund_transactions
for insert with check (true);

-- cleaning schedule
create table if not exists cleaning_schedule (
  id bigserial primary key,
  date date not null,
  task text not null,
  assigned_members text,
  created_at timestamptz default now()
);

alter table if exists cleaning_schedule enable row level security;

drop policy if exists cleaning_select on public.cleaning_schedule;
drop policy if exists cleaning_insert on public.cleaning_schedule;

create policy cleaning_select on public.cleaning_schedule
for select using (true);

create policy cleaning_insert on public.cleaning_schedule
for insert with check (true);

-- wifi bills
create table if not exists wifi_bills (
  id bigserial primary key,
  amount numeric not null,
  due_date date not null,
  paid boolean default false,
  note text,
  created_at timestamptz default now()
);

alter table if exists wifi_bills enable row level security;

drop policy if exists wifi_select on public.wifi_bills;
drop policy if exists wifi_insert on public.wifi_bills;
drop policy if exists wifi_update on public.wifi_bills;

create policy wifi_select on public.wifi_bills
for select using (true);

create policy wifi_insert on public.wifi_bills
for insert with check (true);

create policy wifi_update on public.wifi_bills
for update using (true) with check (true);

-- optional room chat
create table if not exists chat_messages (
  id bigserial primary key,
  author text not null,
  content text not null,
  created_at timestamptz default now()
);

alter table if exists chat_messages enable row level security;

drop policy if exists chat_messages_select on public.chat_messages;
drop policy if exists chat_messages_insert on public.chat_messages;

create policy chat_messages_select on public.chat_messages
for select using (true);

create policy chat_messages_insert on public.chat_messages
for insert with check (true);

-- allow realtime updates for the room tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.members;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.fund_transactions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cleaning_schedule;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wifi_bills;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;
END $$;
