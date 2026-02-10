import { useAppSelector } from "@/store";
import { selectTaskStats } from "@/store/server-state/apiSlice";
import { useGetTasksQuery } from "@/store/server-state/apiSlice";

export function useTaskStats() {
  useGetTasksQuery();
  return useAppSelector(selectTaskStats);
}
