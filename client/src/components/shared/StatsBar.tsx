import { useTaskStats } from "@/hooks";
import { TASK_STATES } from "@/types";

const columnLabels: Record<string, string> = {
  Backlog: "Backlog",
  Todo: "To Do",
  InProgress: "In Progress",
  Done: "Done",
};

export function StatsBar() {
  const { totalTasks, byColumn, completedPercent } = useTaskStats();

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{totalTasks} tasks</span>
      {TASK_STATES.map((state) => (
        <span key={state}>
          {columnLabels[state]}: {byColumn[state] ?? 0}
        </span>
      ))}
      <span className="font-medium text-foreground">
        {completedPercent}% done
      </span>
    </div>
  );
}
