# Spec: Kanban Board

## Phases

### Phase 1 - Foundation
- lib/supabase/client.ts - browser client
- lib/supabase/server.ts - server client
- lib/types.ts - Task, Label, TaskLabel, Column, Priority types
- lib/utils.ts - cn() helper, getDueDateStatus() returning 'overdue'|'soon'|'ok'|null

### Phase 2 - Auth + Board Shell
- app/layout.tsx - root layout, clean font, dark-friendly background
- app/page.tsx - calls signInAnonymously() on first load, persists session, renders Board
- components/Board.tsx - fetches all tasks, wraps in DndContext, renders 4 columns
- components/Column.tsx - droppable zone, header with task count badge, empty state
- components/TaskCard.tsx - draggable, shows title + priority badge + due date + labels

### Phase 3 - Interactions
- Drag and drop: on drop, update task status in Supabase, optimistic UI
- components/CreateTaskModal.tsx - title, description, priority, due_date, labels
- components/StatsBar.tsx - total, done, overdue counts in header
- components/SearchFilterBar.tsx - real-time title search + priority filter dropdown

### Phase 4 - Polish
- components/SkeletonCard.tsx - loading placeholder matching card dimensions
- Empty states: icon + message per column
- Due date colors: red=overdue, amber=within 2 days, green=ok
- DragOverlay: floating card preview while dragging
- Mobile: board scrolls horizontally

## Design Specs Per Component

### TaskCard
- White card, rounded-lg, subtle border, shadow-sm
- Hover: shadow-md, slight translateY(-1px)
- Priority badge: red=high, yellow=normal, green=low
- Due date: small calendar icon + colored text

### Column
- Header: column name left, count badge right
- Badge: rounded pill, muted background
- Empty state: centered icon + "No tasks here yet" in muted gray

### StatsBar
- Sits above the board
- Three stat chips: total (neutral), done (green), overdue (red)

## Definition of Done
- Anonymous auth creates isolated user sessions
- Drag between columns updates Supabase immediately
- Live Vercel URL accessible
- No .env secrets in GitHub
- Looks like something a team would actually use
