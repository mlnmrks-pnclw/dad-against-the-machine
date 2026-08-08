-- Dad Against The Machine — Content OS
-- Run this in the Supabase SQL editor to provision the database.

create extension if not exists "pgcrypto";

create type content_status as enum (
  'idea',
  'developing',
  'ready_to_produce',
  'produced',
  'scheduled',
  'published'
);

create type content_priority as enum ('low', 'medium', 'high');

create type content_format as enum (
  'instagram_reel',
  'instagram_carousel',
  'instagram_story',
  'tiktok',
  'caption'
);

create type content_platform as enum (
  'instagram',
  'tiktok',
  'cross_platform'
);

create table if not exists content_pillars (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  core_message text not null default '',
  pillar_id uuid not null references content_pillars(id) on delete restrict,
  status content_status not null default 'idea',
  priority content_priority not null default 'medium',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_variations (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references ideas(id) on delete cascade,
  format content_format not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (idea_id, format)
);

create table if not exists scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references ideas(id) on delete cascade,
  content_variation_id uuid references content_variations(id) on delete set null,
  platform content_platform not null,
  format content_format not null,
  title text not null,
  scheduled_at timestamptz not null,
  status content_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ideas_status_idx on ideas(status);
create index if not exists ideas_pillar_id_idx on ideas(pillar_id);
create index if not exists ideas_created_at_idx on ideas(created_at desc);
create index if not exists content_variations_idea_id_idx on content_variations(idea_id);
create index if not exists scheduled_posts_scheduled_at_idx on scheduled_posts(scheduled_at);
create index if not exists scheduled_posts_idea_id_idx on scheduled_posts(idea_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger ideas_updated_at
  before update on ideas
  for each row execute function set_updated_at();

create trigger content_variations_updated_at
  before update on content_variations
  for each row execute function set_updated_at();

create trigger scheduled_posts_updated_at
  before update on scheduled_posts
  for each row execute function set_updated_at();

insert into content_pillars (name, slug, sort_order) values
  ('Control', 'control', 1),
  ('Capability', 'capability', 2),
  ('Family Direction', 'family-direction', 3),
  ('Resilience', 'resilience', 4)
on conflict (slug) do nothing;

-- Open RLS for single-user MVP (tighten later if you add auth)
alter table content_pillars enable row level security;
alter table ideas enable row level security;
alter table content_variations enable row level security;
alter table scheduled_posts enable row level security;

create policy "Allow all pillars" on content_pillars for all using (true) with check (true);
create policy "Allow all ideas" on ideas for all using (true) with check (true);
create policy "Allow all variations" on content_variations for all using (true) with check (true);
create policy "Allow all scheduled posts" on scheduled_posts for all using (true) with check (true);
