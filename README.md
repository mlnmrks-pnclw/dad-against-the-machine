# DATM Content OS

Internal content operating system for **Dad Against The Machine**.

Workflow: **Idea → Creation → Production → Scheduling → Published**

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase as the primary database
- Schema in `supabase/schema.sql`

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase

1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL editor
3. Copy `.env.example` to `.env.local` and fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

## Sections

| Route | Purpose |
| --- | --- |
| `/` | Dashboard stats + Add Idea |
| `/ideas` | Idea database with search/filter |
| `/ideas/[id]` | Content creator (formats + schedule) |
| `/board` | Kanban production board |
| `/calendar` | Weekly/monthly schedule planner |
| `/library` | Searchable archive |

## Content pillars

- Control
- Capability
- Family Direction
- Resilience
