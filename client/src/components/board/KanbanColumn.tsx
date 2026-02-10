import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskCard } from "./TaskCard";
import { useFilters } from "@/hooks";
import type { Task, TaskState } from "@/types";
import { cn } from "@/lib/utils";

const columnConfig: Record<
  TaskState,
  { label: string; color: string; bgColor: string }
> = {
  Backlog: {
    label: "Backlog",
    color: "bg-gray-500",
    bgColor: "bg-gray-50 dark:bg-gray-900/30",
  },
  Todo: {
    label: "To Do",
    color: "bg-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  InProgress: {
    label: "In Progress",
    color: "bg-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
  },
  Done: {
    label: "Done",
    color: "bg-green-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
};

interface KanbanColumnProps {
  state: TaskState;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onCreateTask: (state: TaskState) => void;
}

export function KanbanColumn({
  state,
  tasks,
  onTaskClick,
  onCreateTask,
}: KanbanColumnProps) {
  const { isColumnCollapsed, collapseColumn, expandColumn } = useFilters();
  const collapsed = isColumnCollapsed(state);
  const config = columnConfig[state];

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${state}`,
    data: { type: "column", state },
  });

  if (collapsed) {
    return (
      <div
        className={cn(
          "flex w-[48px] flex-col items-center rounded-lg border py-3",
          config.bgColor
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => expandColumn(state)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="mt-2 flex h-6 w-6 items-center justify-center rounded-full bg-background text-xs font-medium">
          {tasks.length}
        </div>
        <div
          className="mt-2"
          style={{ writingMode: "vertical-lr", textOrientation: "mixed" }}
        >
          <span className="text-xs font-medium text-muted-foreground">
            {config.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-[300px] shrink-0 flex-col rounded-lg border",
        config.bgColor,
        isOver && "ring-2 ring-primary/30"
      )}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => collapseColumn(state)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div className={cn("h-2 w-2 rounded-full", config.color)} />
          <h3 className="text-sm font-semibold">{config.label}</h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-1.5 text-xs font-medium">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onCreateTask(state)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 pb-2">
        <div ref={setNodeRef} className="flex min-h-[100px] flex-col gap-2">
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))}
          </SortableContext>
        </div>
      </ScrollArea>
    </div>
  );
}
