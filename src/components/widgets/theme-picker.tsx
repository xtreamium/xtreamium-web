import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { DropdownMenuTriggerFixed } from "@/components/dropdown-menu-trigger-fixed";
import { Icons } from "@/components/icons";
import { useTheme } from "@/hooks/use-theme";
import { themePresets } from "@/constants/themes";
import { CheckIcon, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const themes = Object.entries(themePresets).map(([value, preset]) => ({
  name: preset.label,
  value,
  colors: {
    primary: preset.styles.light.primary,
    secondary: preset.styles.light.secondary,
    accent: preset.styles.light.accent,
    muted: preset.styles.light.muted,
  },
}));

export const ThemePicker = () => {
  const { preset, setThemePreset, mode, toggleTheme } = useTheme();
  const currentTheme = themes.find(t => t.value === preset);
  const [search, setSearch] = useState("");

  const filteredThemes = themes.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DropdownMenu>
      <DropdownMenuTriggerFixed asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2"
        >
          <div className="flex gap-0.5">
            <div 
              className="h-3.5 w-3.5 rounded-l-sm border-y border-l border-foreground/20" 
              style={{ backgroundColor: currentTheme?.colors.primary }}
            />
            <div 
              className="h-3.5 w-3.5 border-y border-foreground/20" 
              style={{ backgroundColor: currentTheme?.colors.accent }}
            />
            <div 
              className="h-3.5 w-3.5 rounded-r-sm border-y border-r border-foreground/20" 
              style={{ backgroundColor: currentTheme?.colors.secondary }}
            />
          </div>
          <span className="hidden sm:inline-block">{currentTheme?.name}</span>
          <Icons.chevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTriggerFixed>
      <DropdownMenuContent align="end" className="w-[320px]">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-semibold">Appearance</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 px-0"
            aria-label={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
          >
            <Icons.sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Icons.moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>

        <DropdownMenuSeparator />
        
        <div className="p-2">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search themes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8"
            />
          </div>
        </div>

        <div className="px-2 py-1">
          <div className="text-xs text-muted-foreground">
            {filteredThemes.length} {filteredThemes.length === 1 ? 'theme' : 'themes'}
          </div>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto p-1">
          <div className="grid gap-1">
            {filteredThemes.map((t) => (
              <DropdownMenuItem
                key={t.value}
                onClick={() => setThemePreset(t.value)}
                className={cn(
                  "flex items-center justify-between gap-3 cursor-pointer px-2 py-2",
                  preset === t.value && "bg-accent"
                )}
              >
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex gap-1">
                    <div 
                      className="h-5 w-5 rounded-sm border border-foreground/20" 
                      style={{ backgroundColor: t.colors.primary }}
                    />
                    <div 
                      className="h-5 w-5 rounded-sm border border-foreground/20" 
                      style={{ backgroundColor: t.colors.accent }}
                    />
                    <div 
                      className="h-5 w-5 rounded-sm border border-foreground/20" 
                      style={{ backgroundColor: t.colors.secondary }}
                    />
                  </div>
                  <span className="text-sm">{t.name}</span>
                </div>
                {preset === t.value && <CheckIcon className="h-4 w-4 flex-shrink-0" />}
              </DropdownMenuItem>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
