import { useEffect, useState } from 'react';
import { themePresets } from '@/constants/themes';

type Mode = 'light' | 'dark';
type ThemePreset = keyof typeof themePresets;

export const useTheme = () => {
  const [mode, setMode] = useState<Mode>(() => {
    const stored = localStorage.getItem('mode') as Mode | null;
    if (stored) {
      return stored;
    }
    
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  const [preset, setPreset] = useState<ThemePreset>(() => {
    const stored = localStorage.getItem('theme-preset') as ThemePreset | null;
    if (stored && stored in themePresets) {
      return stored;
    }
    return 'sunset-horizon';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    
    localStorage.setItem('mode', mode);
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    const currentStyles = themePresets[preset].styles[mode];
    const otherModeStyles = themePresets[preset].styles[mode === 'light' ? 'dark' : 'light'];
    
    console.log('Setting theme:', preset, 'mode:', mode);
    
    // Apply all styles from current mode
    Object.entries(currentStyles).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        root.style.setProperty(`--${key}`, value);
      }
    });
    
    // For font properties, fall back to the other mode if not defined in current mode
    const fontKeys = ['font-sans', 'font-serif', 'font-mono'] as const;
    fontKeys.forEach((key) => {
      if (!currentStyles[key] && otherModeStyles[key]) {
        console.log(`Falling back to ${mode === 'light' ? 'dark' : 'light'} mode for ${key}:`, otherModeStyles[key]);
        root.style.setProperty(`--${key}`, otherModeStyles[key]!);
      }
    });
    
    localStorage.setItem('theme-preset', preset);
  }, [preset, mode]);

  const toggleTheme = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
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
    theme: mode
  };
};