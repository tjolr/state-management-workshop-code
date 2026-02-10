import { useEffect } from "react";
import { useTheme } from "@/hooks";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  return <>{children}</>;
}
