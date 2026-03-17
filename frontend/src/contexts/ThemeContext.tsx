import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { LIGHT_THEME, DARK_THEME, ThemeColors } from "../theme/themePalettes";

type ThemeName = "light" | "dark";

type ThemeContextValue = {
  themeName: ThemeName;
  colors: ThemeColors;
  setThemeName: (t: ThemeName) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "ridar_theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeNameState] = useState<ThemeName>("light");

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(STORAGE_KEY);
        // Ensure app defaults to light theme. If a previous 'dark' value
        // exists in SecureStore (from testing), ignore it so dark mode is
        // not enabled by default. Only apply stored value when it's
        // explicitly 'light'. Users can still toggle to dark and it will
        // be persisted from that point on.
        if (stored === "light") {
          setThemeNameState("light");
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const setThemeName = async (t: ThemeName) => {
    setThemeNameState(t);
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, t);
    } catch (e) {
      // ignore
    }
  };

  const toggleTheme = () => setThemeName(themeName === "light" ? "dark" : "light");

  const colors = themeName === "light" ? LIGHT_THEME : DARK_THEME;

  return (
    <ThemeContext.Provider value={{ themeName, colors, setThemeName, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export default ThemeProvider;
