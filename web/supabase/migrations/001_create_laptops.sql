-- LaptopMatcher — create laptops table
-- Run this in Supabase SQL Editor before seeding

create table if not exists public.laptops (
  id                            integer primary key,
  name                          text not null,
  brand                         text not null,
  model                         text not null,
  price_inr                     integer not null,
  price_segment                 text not null,
  cpu                           text not null,
  cpu_generation                text,
  ram_gb                        smallint not null,
  ram_upgradeable               boolean not null,
  storage                       text not null,
  storage_upgradeable           boolean not null,
  gpu                           text not null,
  gpu_type                      text not null,
  screen_size                   numeric(3,1) not null,
  screen_resolution             text not null,
  display_type                  text not null,
  refresh_rate                  smallint not null,
  battery_wh                    smallint not null,
  estimated_battery_score       numeric(3,1) not null,
  weight_kg                     numeric(3,2) not null,
  estimated_portability_score   numeric(3,1) not null,
  gaming_score                  numeric(3,1) not null,
  future_proof_score            numeric(3,1) not null,
  ai_ml_score                   numeric(3,1) not null,
  coding_score                  numeric(3,1) not null,
  mba_score                     numeric(3,1) not null,
  marketing_score               numeric(3,1) not null,
  design_score                  numeric(3,1) not null,
  mechanical_score              numeric(3,1) not null,
  civil_score                   numeric(3,1) not null,
  electronics_score             numeric(3,1) not null,
  major_fit                     text[] not null default '{}',
  best_for                      text,
  pros                          text,
  cons                          text,
  community_sentiment           text not null,
  india_availability            text not null,
  purchase_links                text,
  last_verified_date            date not null
);

-- Enable Row Level Security (read-only public access)
alter table public.laptops enable row level security;

create policy "Public read access"
  on public.laptops for select
  using (true);

-- Useful indexes for the app's query patterns
create index if not exists idx_laptops_brand          on public.laptops (brand);
create index if not exists idx_laptops_segment        on public.laptops (price_segment);
create index if not exists idx_laptops_price          on public.laptops (price_inr);
create index if not exists idx_laptops_ram            on public.laptops (ram_gb);
create index if not exists idx_laptops_gpu_type       on public.laptops (gpu_type);
create index if not exists idx_laptops_ai_ml          on public.laptops (ai_ml_score desc);
create index if not exists idx_laptops_coding         on public.laptops (coding_score desc);
create index if not exists idx_laptops_mechanical     on public.laptops (mechanical_score desc);
create index if not exists idx_laptops_civil          on public.laptops (civil_score desc);
create index if not exists idx_laptops_electronics    on public.laptops (electronics_score desc);
create index if not exists idx_laptops_mba            on public.laptops (mba_score desc);
create index if not exists idx_laptops_marketing      on public.laptops (marketing_score desc);
create index if not exists idx_laptops_design         on public.laptops (design_score desc);
