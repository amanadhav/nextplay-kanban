export type DueDateStatus = "overdue" | "soon" | "ok" | null;

type ClassValue = string | number | boolean | undefined | null;

/**
 * Lightweight className combiner. Filters out falsy values and joins
 * the rest with a single space. Keeps us free of extra dependencies.
 */
export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Classifies a due date relative to now:
 * - null    -> no due date
 * - overdue -> the date is in the past
 * - soon    -> due within the next 2 days
 * - ok      -> further out
 */
export function getDueDateStatus(dueDate: string | null): DueDateStatus {
  if (!dueDate) return null;

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return null;

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.round(
    (dueDay.getTime() - startOfToday.getTime()) / msPerDay
  );

  if (diffDays < 0) return "overdue";
  if (diffDays <= 2) return "soon";
  return "ok";
}

/**
 * Human-friendly short date, e.g. "Jun 18".
 */
export function formatDueDate(dueDate: string | null): string | null {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return null;
  return due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
