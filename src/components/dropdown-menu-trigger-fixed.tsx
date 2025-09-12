import * as React from "react";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * A wrapper around DropdownMenuTrigger that fixes the hover text visibility issue
 * without modifying the shadcn component directly.
 */
export const DropdownMenuTriggerFixed = React.forwardRef<
  React.ElementRef<typeof DropdownMenuTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuTrigger>
>(({ className, ...props }, ref) => {
  return (
    <DropdownMenuTrigger
      ref={ref}
      className={cn(
        // Fix hover state conflicts by ensuring text remains visible
        "[&:hover]:text-inherit [&:hover>*]:text-inherit",
        // Ensure data-state attributes don't interfere with text visibility
        "data-[state=open]:text-inherit data-[state=open]:*:text-inherit",
        className
      )}
      {...props}
    />
  );
});

DropdownMenuTriggerFixed.displayName = "DropdownMenuTriggerFixed";