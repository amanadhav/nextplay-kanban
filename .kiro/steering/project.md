# NextPlay Kanban - Steering Context

## Project
Kanban task board internship assessment for Next Play Games. Must look polished - design is evaluation criterion #1.

## Stack
- Next.js 14, App Router, TypeScript
- Tailwind CSS
- Supabase (client-side only, no separate backend)
- @dnd-kit/core + @dnd-kit/sortable for drag and drop
- lucide-react for icons
- Vercel for deployment

## Design
- Linear/Notion aesthetic
- Accent color: indigo (indigo-500/600)
- Neutral grays for cards and backgrounds
- Subtle shadows, smooth transitions
- Never generic - no plain white + blue button combos

## Supabase Schema
Tables: tasks, labels, task_labels
RLS enabled. Anonymous auth. Users see only their own data.

## Rules
- Call Supabase directly from frontend, no API layer needed
- Use server components where possible
- Client components only where interactivity requires it
- No secrets hardcoded - env vars only
- Skip unit tests - not required for this assessment
- When using @dnd-kit, fetch the docs first before writing any code
