export interface DirectoryEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

export interface DirectoryListing {
  currentPath: string;
  parentPath: string | null;
  entries: DirectoryEntry[];
}
