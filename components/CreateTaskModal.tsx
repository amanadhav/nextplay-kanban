"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import type {
  Column as ColumnType,
  Label,
  NewTaskInput,
  Priority,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#ef4444", // red
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
];

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  initialStatus: ColumnType;
  labels: Label[];
  onCreate: (input: NewTaskInput) => Promise<boolean>;
  onCreateLabel: (name: string, color: string) => Promise<Label | null>;
}

export default function CreateTaskModal({
  open,
  onClose,
  initialStatus,
  labels,
  onCreate,
  onCreateLabel,
}: CreateTaskModalProps) {
  const [present, setPresent] = useState(open);
  const [entered, setEntered] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [dueDate, setDueDate] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [titleError, setTitleError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Inline label creation
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[0]);
  const [creatingLabel, setCreatingLabel] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);

  // Mount / unmount with enter+exit transitions.
  useEffect(() => {
    if (open) {
      setPresent(true);
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);
    const timer = setTimeout(() => setPresent(false), 160);
    return () => clearTimeout(timer);
  }, [open]);

  // Reset the form each time the modal opens.
  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDescription("");
    setPriority("normal");
    setDueDate("");
    setSelectedLabels([]);
    setTitleError(false);
    setNewLabelName("");
    setNewLabelColor(PRESET_COLORS[0]);
    const focus = setTimeout(() => titleRef.current?.focus(), 60);
    return () => clearTimeout(focus);
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function toggleLabel(id: string) {
    setSelectedLabels((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  }

  async function handleCreateLabel() {
    const name = newLabelName.trim();
    if (!name || creatingLabel) return;
    setCreatingLabel(true);
    const created = await onCreateLabel(name, newLabelColor);
    setCreatingLabel(false);
    if (created) {
      setSelectedLabels((prev) => [...prev, created.id]);
      setNewLabelName("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setTitleError(true);
      titleRef.current?.focus();
      return;
    }

    setSubmitting(true);
    const ok = await onCreate({
      title: trimmed,
      description: description.trim() || null,
      priority,
      due_date: dueDate || null,
      status: initialStatus,
      labelIds: selectedLabels,
    });
    setSubmitting(false);
    if (ok) onClose();
  }

  if (!present) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-150",
        entered ? "opacity-100" : "opacity-0"
      )}
      onMouseDown={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create task"
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          "relative z-10 w-full max-w-md rounded-xl border border-border bg-background-elevated p-5 shadow-2xl transition-all duration-150",
          entered ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">New Task</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Title
            </label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(false);
              }}
              placeholder="What needs to get done?"
              className={cn(
                "w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/50",
                titleError ? "border-red-500/70" : "border-border"
              )}
            />
            {titleError && (
              <p className="mt-1 text-xs text-red-400">A title is required.</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add more detail (optional)"
              className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          {/* Priority + Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Due date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Labels
            </label>
            {labels.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {labels.map((label) => {
                  const active = selectedLabels.includes(label.id);
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-all",
                        active ? "ring-1" : "opacity-70 hover:opacity-100"
                      )}
                      style={{
                        backgroundColor: `${label.color}22`,
                        color: label.color,
                        ...(active
                          ? ({ "--tw-ring-color": label.color } as object)
                          : {}),
                      }}
                    >
                      {active && <Check className="h-3 w-3" />}
                      {label.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Inline create-label */}
            <div className="flex items-center gap-2">
              <input
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateLabel();
                  }
                }}
                placeholder="New label…"
                className="min-w-0 flex-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <div className="flex items-center gap-1">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewLabelColor(color)}
                    aria-label={`Color ${color}`}
                    className={cn(
                      "h-5 w-5 rounded-full transition-transform",
                      newLabelColor === color
                        ? "scale-110 ring-2 ring-white/70"
                        : "hover:scale-110"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleCreateLabel}
                disabled={!newLabelName.trim() || creatingLabel}
                className="rounded-lg bg-white/5 p-1.5 text-muted transition-colors hover:bg-white/10 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Create label"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
