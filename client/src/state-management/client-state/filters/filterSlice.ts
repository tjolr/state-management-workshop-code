import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { FilterState, TagType, TaskState } from "@/types";

const STORAGE_KEY = "kanban-filters";

function loadInitialFilters(): FilterState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        collapsedColumns: Array.isArray(parsed.collapsedColumns)
          ? parsed.collapsedColumns
          : [],
        hiddenColumns: Array.isArray(parsed.hiddenColumns)
          ? parsed.hiddenColumns
          : [],
      };
    }
  } catch {
    // ignore parse errors
  }
  return { tags: [], collapsedColumns: [], hiddenColumns: [] };
}

function persist(state: FilterState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const filterSlice = createSlice({
  name: "filters",
  initialState: loadInitialFilters,
  reducers: {
    toggleTag(state, action: PayloadAction<TagType>) {
      const tag = action.payload;
      const index = state.tags.indexOf(tag);
      if (index === -1) {
        state.tags.push(tag);
      } else {
        state.tags.splice(index, 1);
      }
      persist(state);
    },

    collapseColumn(state, action: PayloadAction<TaskState>) {
      if (!state.collapsedColumns.includes(action.payload)) {
        state.collapsedColumns.push(action.payload);
      }
      persist(state);
    },

    expandColumn(state, action: PayloadAction<TaskState>) {
      const index = state.collapsedColumns.indexOf(action.payload);
      if (index !== -1) {
        state.collapsedColumns.splice(index, 1);
      }
      persist(state);
    },

    hideColumn(state, action: PayloadAction<TaskState>) {
      if (!state.hiddenColumns.includes(action.payload)) {
        state.hiddenColumns.push(action.payload);
      }
      persist(state);
    },

    showColumn(state, action: PayloadAction<TaskState>) {
      const index = state.hiddenColumns.indexOf(action.payload);
      if (index !== -1) {
        state.hiddenColumns.splice(index, 1);
      }
      persist(state);
    },

    clearFilters(state) {
      state.tags = [];
      state.collapsedColumns = [];
      state.hiddenColumns = [];
      persist(state);
    },
  },
});

export const {
  toggleTag,
  collapseColumn,
  expandColumn,
  hideColumn,
  showColumn,
  clearFilters,
} = filterSlice.actions;
export default filterSlice.reducer;
