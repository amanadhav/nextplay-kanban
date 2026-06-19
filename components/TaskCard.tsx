"use client";

import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar } from "lucide-react";
import type { Priority, Task } from "@/lib/types";
import { cn, getDueDateStatus } from "@/lib/utils";

const PRIORITY_STYLES: Record<Priority, { label: string; className: string }> = {
  high: { label: "High", className: "bg-red-500/15 text-red-300" },
  normal: { label: "Normal", className: "bg-amber-500/15 text-amber-300" },
  low: { label: "Low", className: "bg-emerald-500/15 text-emerald-300" },
};

const DUE_DATE_STYLES = {
  overdue: "text-red-400",
  soon: "text-amber-400",
  ok: "text-emerald-400",
} as const;

function formatDueDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

interface CardSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  task: Task;
  dragging?: boolean;
  overlay?: boolean;
  style?: CSSProperties;
}

/**
 * Presentational card surface with no drag wiring. Shared by the sortable
 * TaskCard and the DragOverlay preview so visuals stay identical.
 */
const CardSurface = forwardRef<HTMLDivElement, CardSurfaceProps>(
  function CardSurface(
    { task, dragging, overlay, className, style, ...rest },
    ref
  ) {
    const priority = PRIORITY_STYLES[task.priority];
    const dueStatus = getDueDateStatus(task.due_date);

    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          "rounded-lg border border-border bg-card p-3 shadow-sm",
          "transition-all duration-200 ease-out",
          overlay
            ? "scale-[1.03] cursor-grabbing opacity-90 shadow-xl"
            : "cursor-grab touch-none hover:-translate-y-0.5 hover:bg-card-hover hover:shadow-md",
          dragging && !overlay && "opacity-40",
          className
        )}
        {...rest}
      >
        <h3 className="text-sm font-medium leading-snug text-foreground">
          {task.title}
        </h3>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              priority.className
            )}
          >
            {priority.label}
          </span>

          {task.due_date && dueStatus && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium",
                DUE_DATE_STYLES[dueStatus]
              )}
            >
              <Calendar className="h-3 w-3" />
              {formatDueDate(task.due_date)}
            </span>
          )}
        </div>

        {task.labels && task.labels.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {task.labels.map((label) => (
              <span
                key={label.id}
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `${label.color}22`,
                  color: label.color,
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }
);

/** Floating preview rendered inside DndContext's DragOverlay. */
export function TaskCardOverlay({ task }: { task: Task }) {
  return <CardSurface task={task} overlay />;
}

export default function TaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <CardSurface
      ref={setNodeRef}
      task={task}
      dragging={isDragging}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
}
