import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Icons } from "@/components/icons";
import ImageWithFallback from "@/components/widgets/image-with-fallback";
import { ApiService } from "@/services";
import type { EPGSearchResult } from "@/services/api.service";
import useServerStore from "@/services/state/server.state";
import { cn } from "@/lib/utils";

type SearchModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const useDebouncedValue = <T,>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const parseXmltvTime = (s: string): Date | null => {
  // Format: "YYYYMMDDHHMMSS +ZZZZ"
  const m = s.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*([+-]\d{4})?$/);
  if (!m) {
    return null;
  }
  const [, y, mo, d, h, mi, se, tz] = m;
  const iso = `${y}-${mo}-${d}T${h}:${mi}:${se}${tz ? tz.slice(0, 3) + ":" + tz.slice(3) : "Z"}`;
  const dt = new Date(iso);
  return isNaN(dt.getTime()) ? null : dt;
};

const formatTime = (s: string): string => {
  const d = parseXmltvTime(s);
  if (!d) {
    return s;
  }
  return d.toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatHourMinute = (s: string): string => {
  const d = parseXmltvTime(s);
  if (!d) {
    return s;
  }
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
};

const SearchModal: React.FC<SearchModalProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { selectedServer } = useServerStore();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"live" | "all">("all");
  const debounced = useDebouncedValue(query.trim(), 250);

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: ApiService.getCurrentUser,
  });
  const server = userQuery.data?.servers.find((s) => s.id === selectedServer);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setQuery("");
      }
      onOpenChange(next);
    },
    [onOpenChange]
  );

  const searchQuery = useQuery({
    queryKey: ["epg-search", server?.id, debounced],
    queryFn: () => {
      if (!server) {
        throw new Error("No server selected");
      }
      return ApiService.searchEPG(server, debounced);
    },
    enabled: !!server && debounced.length >= 2,
    staleTime: 30_000,
  });

  const onResultClick = useCallback(
    (r: EPGSearchResult) => {
      if (!r.category_id || r.stream_id === null || r.stream_id === undefined) {
        return;
      }
      handleOpenChange(false);
      void navigate(`/channel/${r.category_id}?focus=${r.stream_id}`);
    },
    [handleOpenChange, navigate]
  );

  const body = useMemo(() => {
    const all = searchQuery.data ?? [];
    const results = filter === "live" ? all.filter((r) => r.is_live) : all;
    if (!server) {
      return (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Select a server to search.
        </div>
      );
    }
    if (debounced.length < 2) {
      return (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Type at least 2 characters to search.
        </div>
      );
    }
    if (searchQuery.isLoading) {
      return (
        <div className="py-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Icons.loader className="h-4 w-4 animate-spin" />
          Searching…
        </div>
      );
    }
    if (searchQuery.isError) {
      return (
        <div className="py-8 text-center text-sm text-destructive">
          Search failed.
        </div>
      );
    }
    if (results.length === 0) {
      return (
        <div className="py-8 text-center text-sm text-muted-foreground">
          {filter === "live"
            ? "No matching programmes airing now."
            : "No matching programmes."}
        </div>
      );
    }
    return (
      <ul className="max-h-[60vh] overflow-y-auto divide-y divide-border">
        {results.map((r) => {
          const enabled =
            !!r.category_id && r.stream_id !== null && r.stream_id !== undefined;
          return (
            <li key={r.programme_id}>
              <button
                type="button"
                onClick={() => onResultClick(r)}
                disabled={!enabled}
                aria-disabled={!enabled}
                title={
                  enabled
                    ? undefined
                    : "Channel not in current server categories"
                }
                className={cn(
                  "w-full text-left px-3 py-2 flex items-center gap-3 transition-colors",
                  enabled
                    ? "hover:bg-accent cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="shrink-0 w-8 h-8 rounded overflow-hidden bg-muted border">
                  <ImageWithFallback
                    className="w-full h-full object-cover"
                    src={r.channel_icon ?? ""}
                    alt={`${r.channel_display_name} icon`}
                    fallback="/images/unknown-stream.svg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{r.title}</span>
                    {r.is_live && (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-red-600 text-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        Live
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {r.is_live
                      ? `Live · ends ${formatHourMinute(r.stop)}`
                      : `${formatTime(r.start)}`}
                    {" · "}
                    {r.channel_display_name}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }, [
    server,
    debounced,
    searchQuery.isLoading,
    searchQuery.isError,
    searchQuery.data,
    onResultClick,
    filter,
  ]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl top-[15vh] translate-y-0">
        <DialogHeader>
          <DialogTitle>Search EPG</DialogTitle>
          <DialogDescription>
            Search upcoming and currently airing shows on the selected server.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search shows…"
            autoFocus
            className="pl-9"
          />
        </div>
        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={(v) => {
            if (v === "live" || v === "all") {
              setFilter(v);
            }
          }}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <ToggleGroupItem value="live">Live now</ToggleGroupItem>
          <ToggleGroupItem value="all">Live and scheduled</ToggleGroupItem>
        </ToggleGroup>
        {body}
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
