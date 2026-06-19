"use client";

import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, LayoutGrid } from "lucide-react";
import type { Task } from "@/lib/types";
import { getDueDateStatus } from "@/lib/utils";

export default function StatsBar({ tasks }: { tasks: Task[] }) {
  const { total, done, overdue } = useMemo(() => {
    let done = 0;
    let overdue = 0;
    for (const task of tasks) {
      if (task.status === "done") done += 1;
      if (task.status !== "done" && getDueDateStatus(task.due_date) === "overdue") {
        overdue += 1;
      }
    }
    return { total: tasks.length, done, overdue };
  }, [tasks]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted">
        <LayoutGrid className="h-3.5 w-3.5" />
        <span className="text-foreground">{total}</span>
        <span>total</span>
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>{done}</span>
        <span>done</span>
      </div>

      {overdue > 0 && (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>{overdue}</span>
          <span>overdue</span>
        </div>
      )}
    </div>
  );
}
