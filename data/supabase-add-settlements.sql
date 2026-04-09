-- Run in Supabase SQL Editor to add settlements table
create table if not exists settlements (
  id            text primary key,       -- ticker + player
  player        text not null,
  ticker        text not null,
  event_ticker  text,
  market_result text,                   -- 'yes' or 'no'
  cost          numeric(10, 4),         -- what was spent
  revenue       numeric(10, 4),         -- payout received
  profit_loss   numeric(10, 4),         -- revenue - cost
  fee_cost      numeric(10, 4),
  settled_time  timestamptz,
  created_at    timestamptz default now()
);

create index if not exists settlements_player_idx on settlements(player);
create index if not exists settlements_settled_time_idx on settlements(settled_time asc);

alter table settlements enable row level security;
create policy "Public read" on settlements for select using (true);
create policy "Service role write" on settlements for all using (auth.role() = 'service_role');
