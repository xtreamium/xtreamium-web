import { useEffect, useState } from "react";
import { useTheme as useNextTheme } from "next-themes";
import { themePresets } from "@/constants/themes";

type Mode = "light" | "dark";
type ThemePreset = keyof typeof themePresets;

const PRESET_STORAGE_KEY = "theme-preset";
const DEFAULT_PRESET: ThemePreset = "sunset-horizon";

export const useTheme = () => {
  const { setTheme, resolvedTheme } = useNextTheme();
  const mode = (resolvedTheme === "dark" ? "dark" : "light") as Mode;

  const [preset, setPreset] = useState<ThemePreset>(() => {
    const stored = localStorage.getItem(PRESET_STORAGE_KEY);
    if (stored && stored in themePresets) {
      return stored as ThemePreset;
    }
    return DEFAULT_PRESET;
  });

  useEffect(() => {
    const root = document.documentElement;
    const currentStyles = themePresets[preset].styles[mode];
    const otherModeStyles =
      themePresets[preset].styles[mode === "light" ? "dark" : "light"];

    Object.entries(currentStyles).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        root.style.setProperty(`--${key}`, value);
      }
    });

    const fontKeys = ["font-sans", "font-serif", "font-mono"] as const;
    fontKeys.forEach((key) => {
      if (!currentStyles[key] && otherModeStyles[key]) {
        root.style.setProperty(`--${key}`, otherModeStyles[key]);
      }
    });

    localStorage.setItem(PRESET_STORAGE_KEY, preset);
  }, [preset, mode]);

  const toggleTheme = () => {
    setTheme(mode === "light" ? "dark" : "light");
  };

  const setMode = (next: Mode) => {
    setTheme(next);
  };

  const setThemePreset = (newPreset: ThemePreset) => {
    if (newPreset in themePresets) {
      setPreset(newPreset);
    }
  };

  return {
    mode,
    setMode,
    preset,
    setThemePreset,
    toggleTheme,
    theme: mode,
  };
};
