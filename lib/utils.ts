type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

/**
 * Lightweight className combiner. Accepts strings, arrays, and
 * conditional objects, filtering out falsy values.
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  const walk = (value: ClassValue): void => {
    if (!value) return;
    if (typeof value === "string" || typeof value === "number") {
      out.push(String(value));
    } else if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (typeof value === "object") {
      for (const [key, enabled] of Object.entries(value)) {
        if (enabled) out.push(key);
      }
    }
  };

  inputs.forEach(walk);
  return out.join(" ");
}

export type DueDateStatus = "overdue" | "soon" | "ok";

/**
 * Classifies a task due date relative to now.
 * - "overdue": due date is in the past
 * - "soon": due within the next 2 days
 * - "ok": further out than 2 days
 * - null: no due date set
 */
export function getDueDateStatus(
  dueDate: string | null | undefined
): DueDateStatus | null {
  if (!dueDate) return null;

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return null;

  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = (due.getTime() - now.getTime()) / msPerDay;

  if (diffDays < 0) return "overdue";
  if (diffDays <= 2) return "soon";
  return "ok";
}
