import React, { useCallback } from "react";
import { SidebarInput } from "@/components/ui/sidebar";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

type ChannelSearchProps = {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  className?: string;
};

const ChannelSearch: React.FC<ChannelSearchProps> = ({ 
  searchTerm, 
  onSearchChange, 
  className 
}) => {
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Icons.search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/50" />
        <SidebarInput
          placeholder="Search channels..."
          value={searchTerm}
          onChange={handleInputChange}
          className="pl-8 pr-4"
        />
      </div>
    </div>
  );
};

export default ChannelSearch;