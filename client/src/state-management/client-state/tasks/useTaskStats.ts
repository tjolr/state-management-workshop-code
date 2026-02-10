import { useAppSelector } from "../../store";
import { selectTaskStats, useGetTasksQuery } from "../../server-state/api/apiSlice";

export function useTaskStats() {
  useGetTasksQuery();
  return useAppSelector(selectTaskStats);
}
