"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

/* ══════════════════════════════════════════════════
   Full Theme System — matches Expo's ThemeContext.tsx

   Features:
   - theme: 'system' | 'dark' | 'light'
   - accentColor: 'green' | 'blue' | 'purple' | 'orange' | 'pink'
   - Drives CSS variables via data-theme / data-accent on <html>
   - Anti-FOUC: layout.tsx has an inline script that sets data-theme
     before React hydration using the same localStorage keys
   - Persists to localStorage ('ish-theme', 'ish-accent')
   - Listens to prefers-color-scheme for system mode
   ══════════════════════════════════════════════════ */

type ThemeMode = "system" | "dark" | "light";
type AccentColor = "green" | "blue" | "purple" | "orange" | "pink";

interface ThemeContextType {
  /** User's theme preference */
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  /** User's accent color preference */
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  /** What's actually rendered right now ('dark' or 'light') */
  resolvedTheme: "dark" | "light";
  /** Convenience: resolvedTheme === 'dark' */
  isDark: boolean;
  /** Toggle between dark/light (ignores system) */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  accentColor: "green",
  setAccentColor: () => {},
  resolvedTheme: "dark",
  isDark: true,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY_THEME = "ish-theme";
const STORAGE_KEY_ACCENT = "ish-accent";

function getSystemPreference(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyToDOM(resolved: "dark" | "light", accent: AccentColor) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;

  // data-theme drives CSS variable sets in globals.css
  html.setAttribute("data-theme", resolved);

  // data-accent overrides accent CSS variables (green is default, no attr needed)
  if (accent === "green") {
    html.removeAttribute("data-accent");
  } else {
    html.setAttribute("data-accent", accent);
  }

  // Update PWA status bar color
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", resolved === "dark" ? "#0a0a0a" : "#ffffff");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode) || "system";
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    if (typeof window === "undefined") return "green";
    return (localStorage.getItem(STORAGE_KEY_ACCENT) as AccentColor) || "green";
  });

  const [systemPref, setSystemPref] = useState<"dark" | "light">(() =>
    getSystemPreference()
  );

  // Resolve theme: system follows OS, otherwise use explicit choice
  const resolvedTheme = useMemo<"dark" | "light">(
    () => (theme === "system" ? systemPref : theme === "light" ? "light" : "dark"),
    [theme, systemPref]
  );

  const isDark = resolvedTheme === "dark";

  // Listen for OS preference changes (for system mode)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemPref(e.matches ? "light" : "dark");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Apply to DOM whenever resolved theme or accent changes
  useEffect(() => {
    applyToDOM(resolvedTheme, accentColor);
  }, [resolvedTheme, accentColor]);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY_THEME, t);
  }, []);

  const setAccentColor = useCallback((c: AccentColor) => {
    setAccentColorState(c);
    localStorage.setItem(STORAGE_KEY_ACCENT, c);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      accentColor,
      setAccentColor,
      resolvedTheme,
      isDark,
      toggleTheme,
    }),
    [theme, setTheme, accentColor, setAccentColor, resolvedTheme, isDark, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
