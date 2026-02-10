import { useTaskStats } from "@/state-management";
import { TASK_STATES } from "@/types";
import type { TaskState } from "@/types";

const columnConfig: Record<TaskState, { label: string; textColor: string }> = {
  Backlog: { label: "Backlog", textColor: "text-gray-500" },
  Todo: { label: "To Do", textColor: "text-blue-500" },
  InProgress: { label: "In Progress", textColor: "text-amber-500" },
  Done: { label: "Done", textColor: "text-green-500" },
};

export function StatsBar() {
  const { totalTasks, byColumn, completedPercent } = useTaskStats();

  return (
    <div className="flex items-center gap-6 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{totalTasks} tasks</span>
      {TASK_STATES.map((state) => (
        <span key={state} className={columnConfig[state].textColor}>
          {columnConfig[state].label}: {byColumn[state] ?? 0}
        </span>
      ))}
      <div className="flex items-center gap-1.5">
        <svg width="20" height="20" viewBox="0 0 20 20" className="shrink-0">
          <circle
            cx="10"
            cy="10"
            r="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-muted-foreground/20"
          />
          <circle
            cx="10"
            cy="10"
            r="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(completedPercent / 100) * 2 * Math.PI * 7} ${2 * Math.PI * 7}`}
            transform="rotate(-90 10 10)"
            className="text-green-500 transition-all duration-300"
          />
        </svg>
        <span className="font-medium text-foreground">
          {completedPercent}%
        </span>
      </div>
    </div>
  );
}
