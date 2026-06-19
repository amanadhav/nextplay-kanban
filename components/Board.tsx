"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { createClient } from "@/lib/supabase/client";
import {
  COLUMNS,
  type Column as ColumnType,
  type Label,
  type NewTaskInput,
  type Task,
} from "@/lib/types";
import Column from "./Column";
import SkeletonCard from "./SkeletonCard";
import StatsBar from "./StatsBar";
import SearchFilterBar, { type PriorityFilter } from "./SearchFilterBar";
import CreateTaskModal from "./CreateTaskModal";
import { TaskCardOverlay } from "./TaskCard";

const COLUMN_IDS = COLUMNS.map((c) => c.id) as ColumnType[];

function isColumnId(value: string): value is ColumnType {
  return (COLUMN_IDS as string[]).includes(value);
}

export default function Board() {
  const supabase = useMemo(() => createClient(), []);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  // Create-task modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<ColumnType>("todo");

  // Active drag item (for the DragOverlay preview)
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; key: number } | null>(
    null
  );
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const [userRes, tasksRes, labelsRes, joinRes] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("tasks").select("*").order("created_at", { ascending: true }),
        supabase.from("labels").select("*"),
        supabase.from("task_labels").select("task_id, label_id"),
      ]);

      if (cancelled) return;

      setUserId(userRes.data.user?.id ?? null);

      const rawTasks = (tasksRes.data ?? []) as Task[];
      const allLabels = (labelsRes.data ?? []) as Label[];
      const joins = (joinRes.data ?? []) as {
        task_id: string;
        label_id: string;
      }[];

      // Hydrate each task with its labels from the join table.
      const labelsById = new Map(allLabels.map((l) => [l.id, l]));
      const labelsByTask = new Map<string, Label[]>();
      for (const { task_id, label_id } of joins) {
        const label = labelsById.get(label_id);
        if (!label) continue;
        const list = labelsByTask.get(task_id) ?? [];
        list.push(label);
        labelsByTask.set(task_id, list);
      }

      const hydrated = rawTasks.map((task) => ({
        ...task,
        labels: labelsByTask.get(task.id) ?? [],
      }));

      setLabels(allLabels);
      setTasks(hydrated);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // Apply search + priority + label filters (single source of truth here).
  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((task) => {
      if (q && !task.title.toLowerCase().includes(q)) return false;
      if (priority !== "all" && task.priority !== priority) return false;
      if (selectedLabels.length > 0) {
        const ids = (task.labels ?? []).map((l) => l.id);
        if (!selectedLabels.some((id) => ids.includes(id))) return false;
      }
      return true;
    });
  }, [tasks, search, priority, selectedLabels]);

  const tasksByColumn = useMemo(() => {
    const grouped: Record<ColumnType, Task[]> = {
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    };
    for (const task of filteredTasks) {
      if (grouped[task.status]) grouped[task.status].push(task);
    }
    return grouped;
  }, [filteredTasks]);

  function toggleLabelFilter(id: string) {
    setSelectedLabels((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  }

  function clearFilters() {
    setSearch("");
    setPriority("all");
    setSelectedLabels([]);
  }

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === String(event.active.id));
    setActiveTask(task ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    let targetColumn: ColumnType | null = null;
    if (isColumnId(overId)) {
      targetColumn = overId;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) targetColumn = overTask.status;
    }

    if (!targetColumn) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask || activeTask.status === targetColumn) return;

    const previousStatus = activeTask.status;
    const destination = targetColumn;

    // Optimistic local move.
    setTasks((prev) =>
      prev.map((t) => (t.id === activeId ? { ...t, status: destination } : t))
    );

    const { error } = await supabase
      .from("tasks")
      .update({ status: destination })
      .eq("id", activeId);

    if (error) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId ? { ...t, status: previousStatus } : t
        )
      );
      showToast("Couldn't move task. Change reverted.");
    }
  }

  function openCreateModal(columnId: ColumnType) {
    setModalStatus(columnId);
    setModalOpen(true);
  }

  async function handleCreateTask(input: NewTaskInput): Promise<boolean> {
    if (!userId) {
      showToast("No active session. Please reload.");
      return false;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const taskLabels = labels.filter((l) => input.labelIds.includes(l.id));

    const optimistic: Task = {
      id,
      user_id: userId,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      due_date: input.due_date,
      created_at: now,
      updated_at: now,
      labels: taskLabels,
    };

    setTasks((prev) => [...prev, optimistic]);

    const { error } = await supabase.from("tasks").insert({
      id,
      user_id: userId,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      due_date: input.due_date,
    });

    if (error) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showToast("Couldn't create task. Please try again.");
      return false;
    }

    if (input.labelIds.length > 0) {
      const rows = input.labelIds.map((label_id) => ({
        task_id: id,
        label_id,
      }));
      const { error: joinError } = await supabase
        .from("task_labels")
        .insert(rows);
      if (joinError) {
        showToast("Task created, but labels failed to attach.");
      }
    }

    return true;
  }

  async function handleCreateLabel(
    name: string,
    color: string
  ): Promise<Label | null> {
    if (!userId) {
      showToast("No active session. Please reload.");
      return null;
    }

    const id = crypto.randomUUID();
    const optimistic: Label = {
      id,
      user_id: userId,
      name,
      color,
      created_at: new Date().toISOString(),
    };

    setLabels((prev) => [...prev, optimistic]);

    const { error } = await supabase
      .from("labels")
      .insert({ id, user_id: userId, name, color });

    if (error) {
      setLabels((prev) => prev.filter((l) => l.id !== id));
      showToast("Couldn't create label.");
      return null;
    }

    return optimistic;
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-5">
        <h1 className="text-lg font-semibold text-foreground">
          NextPlay Kanban
        </h1>
        <p className="text-sm text-muted">Plan, track, and ship your work.</p>
      </header>

      <div className="mb-4 space-y-3">
        <StatsBar tasks={tasks} />
        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          priority={priority}
          onPriorityChange={setPriority}
          labels={labels}
          selectedLabels={selectedLabels}
          onToggleLabel={toggleLabelFilter}
          onClear={clearFilters}
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveTask(null)}
      >
        <div className="flex gap-4 overflow-x-auto pb-8">
          {COLUMNS.map((column) =>
            loading ? (
              <div
                key={column.id}
                className="flex min-w-[300px] flex-shrink-0 flex-col"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="text-sm font-semibold text-foreground">
                    {column.title}
                  </span>
                </div>
                <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-background-elevated/40 p-2">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              </div>
            ) : (
              <Column
                key={column.id}
                column={column}
                tasks={tasksByColumn[column.id]}
                onAddTask={openCreateModal}
              />
            )
          )}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialStatus={modalStatus}
        labels={labels}
        onCreate={handleCreateTask}
        onCreateLabel={handleCreateLabel}
      />

      {toast && (
        <div
          key={toast.key}
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 animate-toast rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200 shadow-lg backdrop-blur"
        >
          {toast.message}
        </div>
      )}
    </main>
  );
}
