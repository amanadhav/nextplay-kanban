export type Priority = "low" | "normal" | "high";

export type ColumnId = "backlog" | "todo" | "in_progress" | "done";

export interface Label {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface TaskLabel {
  task_id: string;
  label_id: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: ColumnId;
  priority: Priority;
  due_date: string | null;
  position: number;
  created_at: string;
  labels: Label[];
}

export interface Column {
  id: ColumnId;
  title: string;
}

export const COLUMNS: Column[] = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];
