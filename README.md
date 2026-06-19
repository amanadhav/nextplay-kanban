# NextPlay Kanban

A polished Kanban board for tracking work in flight — built as an internship assessment for Next Play Games.

Drag tasks across columns, create tasks with priorities, due dates, and labels, and search/filter in real time. Each visitor gets an isolated, anonymous session backed by Supabase row-level security.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — Linear/Notion-inspired UI with an indigo accent
- **Supabase** — Postgres, anonymous auth, RLS (called directly from the client, no API layer)
- **@dnd-kit** — drag and drop
- **lucide-react** — icons

## Features

- Anonymous sign-in on first load with a persisted session
- Four-column board (Backlog, To Do, In Progress, Done)
- Drag and drop between columns with **optimistic UI** and rollback on failure
- Create tasks with title, description, priority, due date, and labels
- Live title search and priority filter
- Stats bar: total / done / overdue
- Skeleton loading states, empty states, and a floating drag overlay
- Responsive: the board scrolls horizontally on small screens

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase values
npm run dev
```

Open http://localhost:3000.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **Authentication > Providers**, enable **Anonymous sign-ins**.
3. Open the **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql) to create the `tasks`, `labels`, and `task_labels` tables with RLS policies.
4. Copy your **Project URL** and **anon key** from **Project Settings > API** into `.env.local`.

## Environment variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous public key |

## Deploy

Deploy on [Vercel](https://vercel.com): import the repo, add the two env vars above, and deploy.
