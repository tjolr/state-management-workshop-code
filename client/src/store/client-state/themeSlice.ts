import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Theme } from "@/types";

interface ThemeState {
  mode: Theme;
}

function loadInitialTheme(): ThemeState {
  try {
    const stored = localStorage.getItem("kanban-theme");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (
        parsed.mode === "light" ||
        parsed.mode === "dark" ||
        parsed.mode === "system"
      ) {
        return parsed;
      }
    }
  } catch {
    // ignore parse errors
  }
  return { mode: "system" };
}

const themeSlice = createSlice({
  name: "theme",
  initialState: loadInitialTheme,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.mode = action.payload;
      localStorage.setItem("kanban-theme", JSON.stringify({ mode: state.mode }));
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
