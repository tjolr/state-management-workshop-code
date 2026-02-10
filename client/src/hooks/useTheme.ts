import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setTheme as setThemeAction } from "@/store/client-state/themeSlice";
import type { Theme } from "@/types";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(
    getSystemTheme,
  );

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const resolvedTheme = useMemo<"light" | "dark">(
    () => (theme === "system" ? systemTheme : theme),
    [theme, systemTheme],
  );

  const setTheme = useCallback(
    (newTheme: Theme) => {
      dispatch(setThemeAction(newTheme));
    },
    [dispatch],
  );

  return {
    theme,
    resolvedTheme,
    setTheme,
  };
}
