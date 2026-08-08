# DATM Content OS

Internal content operating system for **Dad Against The Machine**.

Workflow: **Idea → Creation → Production → Scheduling → Published**

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Local browser storage for immediate use (MVP)
- Supabase schema ready in `supabase/schema.sql`

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase (optional)

1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL editor
3. Copy `.env.example` to `.env.local` and fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

The UI currently persists to local storage so you can use the system immediately. The schema matches the app data model for a clean migration later.

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
