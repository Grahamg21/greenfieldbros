-- Run this in Supabase SQL Editor
-- https://sitllgzajcrwimdszvqn.supabase.co

create table if not exists bets (
  id               text primary key,        -- Kalshi trade ID
  player           text not null,           -- 'graham' or 'gabe'
  market_id        text,
  market_title     text,
  category         text default 'sports',   -- sports, politics, other
  side             text,                    -- 'yes' or 'no'
  contracts        integer,
  price            numeric(10, 2),          -- cents per contract (0-100)
  total_cost       numeric(10, 2),          -- total spent
  status           text default 'open',     -- open | won | lost
  payout           numeric(10, 2) default 0,
  profit_loss      numeric(10, 2) default 0,
  placed_at        timestamptz,
  settled_at       timestamptz,
  created_at       timestamptz default now()
);

-- Index for fast player queries
create index if not exists bets_player_idx on bets(player);
create index if not exists bets_status_idx on bets(status);
create index if not exists bets_placed_at_idx on bets(placed_at desc);

-- Enable public read (site reads bets), but only server can write
alter table bets enable row level security;

create policy "Public read" on bets
  for select using (true);

create policy "Service role write" on bets
  for all using (auth.role() = 'service_role');
