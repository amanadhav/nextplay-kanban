"use client";

import { Search, X } from "lucide-react";
import type { Label, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

export type PriorityFilter = Priority | "all";

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  priority: PriorityFilter;
  onPriorityChange: (value: PriorityFilter) => void;
  labels: Label[];
  selectedLabels: string[];
  onToggleLabel: (id: string) => void;
  onClear: () => void;
}

export default function SearchFilterBar({
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  labels,
  selectedLabels,
  onToggleLabel,
  onClear,
}: SearchFilterBarProps) {
  const hasActiveFilters =
    search.trim() !== "" || priority !== "all" || selectedLabels.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks…"
          className="w-48 rounded-lg border border-border bg-card py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/50 sm:w-60"
        />
      </div>

      {/* Priority filter */}
      <select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value as PriorityFilter)}
        className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
        aria-label="Filter by priority"
      >
        <option value="all">All priorities</option>
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
      </select>

      {/* Label filters */}
      {labels.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {labels.map((label) => {
            const active = selectedLabels.includes(label.id);
            return (
              <button
                key={label.id}
                type="button"
                onClick={() => onToggleLabel(label.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium transition-all",
                  active ? "ring-1" : "opacity-60 hover:opacity-100"
                )}
                style={{
                  backgroundColor: `${label.color}22`,
                  color: label.color,
                  ...(active
                    ? ({ "--tw-ring-color": label.color } as object)
                    : {}),
                }}
              >
                {label.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Clear */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex animate-fade-in items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </button>
      )}
    </div>
  );
}
