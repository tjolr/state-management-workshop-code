import { useMemo } from "react";
import { useGetTasksQuery } from "@/store/server-state/apiSlice";
import type { TagType, TaskState } from "@/types";
import { ALL_TAGS, TASK_STATES } from "@/types";

export function useTaskStats() {
  const { data: tasks = [] } = useGetTasksQuery();

  const totalTasks = tasks.length;

  const byColumn = useMemo(() => {
    const counts = {} as Record<TaskState, number>;
    for (const state of TASK_STATES) {
      counts[state] = 0;
    }
    for (const task of tasks) {
      if (counts[task.state] !== undefined) {
        counts[task.state]++;
      }
    }
    return counts;
  }, [tasks]);

  const byTag = useMemo(() => {
    const counts = {} as Record<TagType, number>;
    for (const tag of ALL_TAGS) {
      counts[tag] = 0;
    }
    for (const task of tasks) {
      for (const tag of task.tags) {
        if (counts[tag] !== undefined) {
          counts[tag]++;
        }
      }
    }
    return counts;
  }, [tasks]);

  const completedPercent = useMemo(() => {
    if (totalTasks === 0) return 0;
    const doneCount = byColumn.Done ?? 0;
    return Math.round((doneCount / totalTasks) * 100);
  }, [totalTasks, byColumn]);

  return {
    totalTasks,
    byColumn,
    byTag,
    completedPercent,
  };
}
