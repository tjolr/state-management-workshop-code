import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  toggleTag as toggleTagAction,
  collapseColumn as collapseColumnAction,
  expandColumn as expandColumnAction,
  hideColumn as hideColumnAction,
  showColumn as showColumnAction,
  clearFilters as clearFiltersAction,
} from "./filterSlice";
import type { TagType, TaskState } from "@/types";

export function useFilters() {
  const dispatch = useAppDispatch();
  const activeFilters = useAppSelector((state) => state.filters);

  const toggleTag = useCallback(
    (tag: TagType) => {
      dispatch(toggleTagAction(tag));
    },
    [dispatch],
  );

  const collapseColumn = useCallback(
    (state: TaskState) => {
      dispatch(collapseColumnAction(state));
    },
    [dispatch],
  );

  const expandColumn = useCallback(
    (state: TaskState) => {
      dispatch(expandColumnAction(state));
    },
    [dispatch],
  );

  const toggleColumn = useCallback(
    (state: TaskState) => {
      if (activeFilters.collapsedColumns.includes(state)) {
        dispatch(expandColumnAction(state));
      } else {
        dispatch(collapseColumnAction(state));
      }
    },
    [dispatch, activeFilters.collapsedColumns],
  );

  const hideColumn = useCallback(
    (state: TaskState) => {
      dispatch(hideColumnAction(state));
    },
    [dispatch],
  );

  const showColumn = useCallback(
    (state: TaskState) => {
      dispatch(showColumnAction(state));
    },
    [dispatch],
  );

  const isColumnCollapsed = useCallback(
    (state: TaskState) => activeFilters.collapsedColumns.includes(state),
    [activeFilters.collapsedColumns],
  );

  const isColumnHidden = useCallback(
    (state: TaskState) => activeFilters.hiddenColumns.includes(state),
    [activeFilters.hiddenColumns],
  );

  const clearFilters = useCallback(() => {
    dispatch(clearFiltersAction());
  }, [dispatch]);

  const hasActiveFilters = useMemo(
    () =>
      activeFilters.tags.length > 0 ||
      activeFilters.collapsedColumns.length > 0 ||
      activeFilters.hiddenColumns.length > 0,
    [activeFilters],
  );

  return {
    activeFilters,
    toggleTag,
    collapseColumn,
    expandColumn,
    toggleColumn,
    hideColumn,
    showColumn,
    isColumnCollapsed,
    isColumnHidden,
    clearFilters,
    hasActiveFilters,
  };
}
