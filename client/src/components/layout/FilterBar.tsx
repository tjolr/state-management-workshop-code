import { Filter, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TagBadge } from "@/components/shared/TagBadge";
import { SortControl } from "@/components/shared/SortControl";
import { useFilters } from "@/hooks";
import { ALL_TAGS, TASK_STATES, type TaskState } from "@/types";

const columnLabels: Record<TaskState, string> = {
  Backlog: "Backlog",
  Todo: "To Do",
  InProgress: "In Progress",
  Done: "Done",
};

export function FilterBar() {
  const {
    activeFilters,
    toggleTag,
    toggleColumn,
    isColumnHidden,
    clearFilters,
    hasActiveFilters,
  } = useFilters();

  return (
    <div className="flex items-center gap-3 border-b px-4 py-2">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Tags:</span>
        {ALL_TAGS.map((tag) => (
          <TagBadge
            key={tag}
            tag={tag}
            onClick={() => toggleTag(tag)}
            active={
              activeFilters.tags.length === 0 ||
              activeFilters.tags.includes(tag)
            }
          />
        ))}
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Columns:
        </span>
        {TASK_STATES.map((state) => (
          <Button
            key={state}
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => toggleColumn(state)}
          >
            {isColumnHidden(state) ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
            {columnLabels[state]}
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6" />

      <SortControl />

      {hasActiveFilters && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={clearFilters}
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        </>
      )}
    </div>
  );
}
