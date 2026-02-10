import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  setSortField as setSortFieldAction,
  setSortDirection as setSortDirectionAction,
  toggleSortDirection as toggleSortDirectionAction,
} from "./sortingSlice";
import type { SortDirection, SortField } from "@/types";

export function useSorting() {
  const dispatch = useAppDispatch();
  const sorting = useAppSelector((state) => state.sorting);

  const setSortField = useCallback(
    (field: SortField) => {
      dispatch(setSortFieldAction(field));
    },
    [dispatch],
  );

  const setSortDirection = useCallback(
    (direction: SortDirection) => {
      dispatch(setSortDirectionAction(direction));
    },
    [dispatch],
  );

  const toggleSortDirection = useCallback(() => {
    dispatch(toggleSortDirectionAction());
  }, [dispatch]);

  return {
    sorting,
    setSortField,
    setSortDirection,
    toggleSortDirection,
  };
}
