import React, { useCallback } from "react";
import { SidebarInput } from "@/components/ui/sidebar";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

type ChannelSearchProps = {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedIndex: number;
  onSelectedIndexChange: (index: number) => void;
  onSelectItem: () => void;
  itemCount: number;
  className?: string;
};

const ChannelSearch: React.FC<ChannelSearchProps> = ({ 
  searchTerm, 
  onSearchChange,
  selectedIndex,
  onSelectedIndexChange,
  onSelectItem,
  itemCount,
  className 
}) => {
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
    // Reset selected index when search changes
    onSelectedIndexChange(-1);
  }, [onSearchChange, onSelectedIndexChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (itemCount === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        onSelectedIndexChange(selectedIndex < itemCount - 1 ? selectedIndex + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        onSelectedIndexChange(selectedIndex > 0 ? selectedIndex - 1 : itemCount - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          onSelectItem();
        }
        break;
      case 'Escape':
        onSearchChange('');
        onSelectedIndexChange(-1);
        break;
    }
  }, [selectedIndex, itemCount, onSelectedIndexChange, onSelectItem, onSearchChange]);

  return (
    <div className={cn("relative w-full pb-2", className)}>
      <div className="relative">
        <Icons.search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/50" />
        <SidebarInput
          placeholder="Search categories..."
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="pl-8 pr-4"
        />
      </div>
    </div>
  );
};

export default ChannelSearch;