import { useEffect, useState } from "react";

export type ThemeColors = {
  accent: string;
  signal: string;
  amber: string;
  red: string;
  violet: string;
  muted: string;
  border: string;
};

export function useThemeColors(theme: string): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>({
    accent: "#4F8EFF",
    signal: "#3FD6C5",
    amber: "#E8A94D",
    red: "#E2665A",
    violet: "#9C8CE0",
    muted: "#8C9FB3",
    border: "#2A3B4D",
  });

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const c = (name: string) => styles.getPropertyValue(name).trim();
    // Canvas can't read CSS custom properties directly, so resolved colors must be
    // read from the DOM (client-only) and re-read whenever the theme changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setColors({
      accent: c("--copper"),
      signal: c("--signal"),
      amber: c("--amber"),
      red: c("--red"),
      violet: c("--violet"),
      muted: c("--text-muted"),
      border: c("--border"),
    });
  }, [theme]);

  return colors;
}
