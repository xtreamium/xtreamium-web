import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ProxyService } from "@/services/proxy.service";
import type { DirectoryEntry } from "@/models/directory-listing";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FolderBrowserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (path: string) => void;
  title?: string;
  mode?: "folder" | "file";
  fileFilter?: string[];
}

export const FolderBrowserDialog: React.FC<FolderBrowserDialogProps> = ({
  open,
  onOpenChange,
  onSelect,
  title = "Select Folder",
  mode = "folder",
  fileFilter,
}) => {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [parentPath, setParentPath] = useState<string | null>(null);
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const loadDirectory = async (path?: string) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedFile(null);
      const listing = await ProxyService.listDirectory(path);
      setCurrentPath(listing.currentPath);
      setParentPath(listing.parentPath);

      // Filter entries based on mode
      let filteredEntries = listing.entries;
      if (mode === "folder") {
        filteredEntries = listing.entries.filter((e) => e.isDirectory);
      } else if (mode === "file" && fileFilter && fileFilter.length > 0) {
        filteredEntries = listing.entries.filter(
          (e) =>
            e.isDirectory ||
            fileFilter.some((ext) =>
              e.name.toLowerCase().endsWith(ext.toLowerCase())
            )
        );
      }

      setEntries(filteredEntries);
    } catch (_err) {
      setError("Failed to load directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      void loadDirectory();
    }
  }, [open]);

  const handleEntryClick = (entry: DirectoryEntry) => {
    if (entry.isDirectory) {
      void loadDirectory(entry.path);
    } else if (mode === "file") {
      setSelectedFile(entry.path);
    }
  };

  const handleEntryDoubleClick = (entry: DirectoryEntry) => {
    if (!entry.isDirectory && mode === "file") {
      onSelect(entry.path);
      onOpenChange(false);
    }
  };

  const handleGoUp = () => {
    if (parentPath) {
      void loadDirectory(parentPath);
    }
  };

  const handleSelect = () => {
    if (mode === "folder") {
      onSelect(currentPath);
    } else if (selectedFile) {
      onSelect(selectedFile);
    }
    onOpenChange(false);
  };

  const canSelect = mode === "folder" || selectedFile !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Current path breadcrumb */}
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <Icons.folderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
          <code className="text-sm truncate flex-1">{currentPath}</code>
        </div>

        {/* Directory listing */}
        <ScrollArea className="h-[300px] border rounded-md">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Icons.loader className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <Icons.delete className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : (
            <div className="p-1">
              {/* Go up button */}
              {parentPath && (
                <button
                  type="button"
                  onClick={handleGoUp}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left"
                >
                  <Icons.chevronUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">..</span>
                </button>
              )}

              {/* Entries */}
              {entries.map((entry) => (
                <button
                  key={entry.path}
                  type="button"
                  onClick={() => handleEntryClick(entry)}
                  onDoubleClick={() => handleEntryDoubleClick(entry)}
                  className={`w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left ${
                    selectedFile === entry.path
                      ? "bg-primary/10 border border-primary/20"
                      : ""
                  }`}
                >
                  {entry.isDirectory ? (
                    <Icons.folderOpen className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Icons.server className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm truncate">{entry.name}</span>
                </button>
              ))}

              {entries.length === 0 && !parentPath && (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  No items found
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!canSelect}>
            Select
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
