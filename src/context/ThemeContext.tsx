"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from "react";

const ACCENT_COLORS: Record<string, { primary: string; dark: string; darker: string; glow: string }> = {
  green:  { primary: "#4ade80", dark: "#22c55e", darker: "#16a34a", glow: "rgba(74, 222, 128, 0.4)" },
  blue:   { primary: "#60a5fa", dark: "#3b82f6", darker: "#2563eb", glow: "rgba(96, 165, 250, 0.4)" },
  purple: { primary: "#a78bfa", dark: "#8b5cf6", darker: "#7c3aed", glow: "rgba(167, 139, 250, 0.4)" },
  orange: { primary: "#fb923c", dark: "#f97316", darker: "#ea580c", glow: "rgba(251, 146, 60, 0.4)" },
  pink:   { primary: "#f472b6", dark: "#ec4899", darker: "#db2777", glow: "rgba(244, 114, 182, 0.4)" },
};

interface ThemeContextType {
  accentColor: string;
  setAccentColor: (color: string) => void;
  accent: { primary: string; dark: string; darker: string; glow: string };
}

const ThemeContext = createContext<ThemeContextType>({
  accentColor: "green",
  setAccentColor: () => {},
  accent: ACCENT_COLORS.green,
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accentColor, setAccentColorState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ish-accent") || "green";
    }
    return "green";
  });

  const setAccentColor = useCallback((color: string) => {
    setAccentColorState(color);
    if (typeof window !== "undefined") {
      localStorage.setItem("ish-accent", color);
      // Update CSS variables
      const accent = ACCENT_COLORS[color] || ACCENT_COLORS.green;
      document.documentElement.style.setProperty("--accent", accent.primary);
      document.documentElement.style.setProperty("--accent-dark", accent.dark);
      document.documentElement.style.setProperty("--accent-darker", accent.darker);
      document.documentElement.style.setProperty("--accent-glow", accent.glow);
    }
  }, []);

  const accent = useMemo(() => ACCENT_COLORS[accentColor] || ACCENT_COLORS.green, [accentColor]);

  return (
    <ThemeContext.Provider value={{ accentColor, setAccentColor, accent }}>
      {children}
    </ThemeContext.Provider>
  );
}
