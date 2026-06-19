"use client";

import type { ComponentType } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  CheckCircle2,
  Circle,
  Eye,
  Plus,
  Timer,
  type LucideProps,
} from "lucide-react";
import type { Column as ColumnType, Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import TaskCard from "./TaskCard";

interface ColumnMeta {
  badge: string;
  icon: ComponentType<LucideProps>;
  emptyMessage: string;
}

const COLUMN_META: Record<ColumnType, ColumnMeta> = {
  todo: {
    badge: "bg-blue-500/15 text-blue-300",
    icon: Circle,
    emptyMessage: "No tasks yet. Add one to get started.",
  },
  in_progress: {
    badge: "bg-amber-500/15 text-amber-300",
    icon: Timer,
    emptyMessage: "Nothing in progress. Pick a task to start.",
  },
  in_review: {
    badge: "bg-purple-500/15 text-purple-300",
    icon: Eye,
    emptyMessage: "Nothing to review yet.",
  },
  done: {
    badge: "bg-emerald-500/15 text-emerald-300",
    icon: CheckCircle2,
    emptyMessage: "No completed tasks yet. Keep going!",
  },
};

interface ColumnProps {
  column: { id: ColumnType; title: string };
  tasks: Task[];
  onAddTask: (columnId: ColumnType) => void;
}

export default function Column({ column, tasks, onAddTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const meta = COLUMN_META[column.id];
  const EmptyIcon = meta.icon;
  const taskIds = tasks.map((t) => t.id);

  return (
    <div className="flex min-w-[300px] flex-shrink-0 flex-col">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            {column.title}
          </h2>
          <span
            className={cn(
              "min-w-6 rounded-full px-2 py-0.5 text-center text-xs font-medium",
              meta.badge
            )}
          >
            {tasks.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onAddTask(column.id)}
          className="rounded-md p-1 text-muted transition-colors hover:bg-white/5 hover:text-foreground"
          aria-label={`Add task to ${column.title}`}
          title="New task"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* New task button */}
      <button
        type="button"
        onClick={() => onAddTask(column.id)}
        className="mb-2 flex items-center justify-center gap-1 rounded-lg border border-dashed border-border/70 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/50 hover:bg-accent/5 hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        New task
      </button>

      {/* Droppable body */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-32 flex-1 flex-col gap-2 rounded-xl border border-border/60 bg-background-elevated/40 p-2 transition-colors",
          isOver && "border-accent/60 bg-accent/5"
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-12 text-center text-muted">
              <EmptyIcon className="h-6 w-6 opacity-50" />
              <p className="text-xs leading-relaxed">{meta.emptyMessage}</p>
            </div>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </SortableContext>
      </div>
    </div>
  );
}
