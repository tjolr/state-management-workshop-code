import { useCallback, useMemo } from "react";
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useMoveTaskMutation,
  useReorderTasksMutation,
} from "../../server-state/api/apiSlice";
import type { CreateTaskInput, UpdateTaskInput, ReorderTaskEntry } from "@/types/api";
import { useFilters } from "../filters/useFilters";
import { useSorting } from "../sorting/useSorting";
import type { Task, TaskState } from "@/types";
import { TASK_STATES } from "@/types";

function compareTasks(
  a: Task,
  b: Task,
  field: string,
  direction: "asc" | "desc",
): number {
  let result = 0;

  switch (field) {
    case "title":
      result = a.title.localeCompare(b.title);
      break;
    case "createdAt":
      result =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      break;
    case "assigneeCount":
      result = a.assignees.length - b.assignees.length;
      break;
    case "manual":
    default:
      result = a.position - b.position;
      break;
  }

  return direction === "desc" ? -result : result;
}

export function useTasks() {
  const { data: tasks = [], isLoading, error } = useGetTasksQuery();
  const [createTaskMutation] = useCreateTaskMutation();
  const [updateTaskMutation] = useUpdateTaskMutation();
  const [deleteTaskMutation] = useDeleteTaskMutation();
  const [moveTaskMutation] = useMoveTaskMutation();
  const [reorderTasksMutation] = useReorderTasksMutation();

  const { activeFilters } = useFilters();
  const { sorting } = useSorting();

  const tasksByColumn = useMemo(() => {
    // Start with an empty record for every column
    const columns: Record<TaskState, Task[]> = {
      Backlog: [],
      Todo: [],
      InProgress: [],
      Done: [],
    };

    // Filter tasks by active tag filters
    let filtered = tasks;
    if (activeFilters.tags.length > 0) {
      filtered = tasks.filter((task) =>
        task.tags.some((tag) => activeFilters.tags.includes(tag)),
      );
    }

    // Group into columns
    for (const task of filtered) {
      if (columns[task.state]) {
        columns[task.state].push(task);
      }
    }

    // Sort within each column
    for (const state of TASK_STATES) {
      columns[state].sort((a, b) =>
        compareTasks(a, b, sorting.field, sorting.direction),
      );
    }

    return columns;
  }, [tasks, activeFilters.tags, sorting.field, sorting.direction]);

  const createTask = useCallback(
    (data: CreateTaskInput) => createTaskMutation(data).unwrap(),
    [createTaskMutation],
  );

  const updateTask = useCallback(
    (id: string, data: UpdateTaskInput["data"]) =>
      updateTaskMutation({ id, data }).unwrap(),
    [updateTaskMutation],
  );

  const deleteTask = useCallback(
    (id: string) => deleteTaskMutation(id).unwrap(),
    [deleteTaskMutation],
  );

  const moveTask = useCallback(
    (id: string, state: TaskState, position: number) =>
      moveTaskMutation({ id, state, position }).unwrap(),
    [moveTaskMutation],
  );

  const reorderTasks = useCallback(
    (reorderEntries: ReorderTaskEntry[]) =>
      reorderTasksMutation(reorderEntries).unwrap(),
    [reorderTasksMutation],
  );

  return {
    tasks,
    tasksByColumn,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
  };
}
