import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SortDirection, SortField, SortingState } from "@/types";

const STORAGE_KEY = "kanban-sorting";

function loadInitialSorting(): SortingState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.field && parsed.direction) {
        return {
          field: parsed.field,
          direction: parsed.direction,
        };
      }
    }
  } catch {
    // ignore parse errors
  }
  return { field: "manual", direction: "asc" };
}

function persist(state: SortingState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const sortingSlice = createSlice({
  name: "sorting",
  initialState: loadInitialSorting,
  reducers: {
    setSortField(state, action: PayloadAction<SortField>) {
      state.field = action.payload;
      persist(state);
    },

    setSortDirection(state, action: PayloadAction<SortDirection>) {
      state.direction = action.payload;
      persist(state);
    },

    toggleSortDirection(state) {
      state.direction = state.direction === "asc" ? "desc" : "asc";
      persist(state);
    },
  },
});

export const { setSortField, setSortDirection, toggleSortDirection } =
  sortingSlice.actions;
export default sortingSlice.reducer;
