/**
 * Domain types for the Kanban board.
 * Mirrors the Supabase schema: tasks, labels, task_labels.
 */

/** Task priority levels. */
export type Priority = "low" | "normal" | "high";

/** The four Kanban columns. Stored as `status` on a task. */
export type Column = "todo" | "in_progress" | "in_review" | "done";

/** Ordered list of columns for rendering the board left-to-right. */
export const COLUMNS: { id: Column; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "in_review", title: "In Review" },
  { id: "done", title: "Done" },
];

/** A label that can be attached to tasks. Row in the `labels` table. */
export interface Label {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

/** Join row in the `task_labels` table. */
export interface TaskLabel {
  task_id: string;
  label_id: string;
}

/** A task. Row in the `tasks` table. */
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: Column;
  priority: Priority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  /** Hydrated client-side from the task_labels join; not a DB column. */
  labels?: Label[];
}

/** Shape submitted from the create-task form. */
export interface NewTaskInput {
  title: string;
  description: string | null;
  priority: Priority;
  due_date: string | null;
  status: Column;
  labelIds: string[];
}
