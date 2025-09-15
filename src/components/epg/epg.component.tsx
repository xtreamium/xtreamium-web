import { ApiService } from "@/services";
import type { Server } from "@/models/server";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icons } from "@/components/icons";

interface IEPGComponentProps {
  server: Server;
  channelId: string;
}

interface RawEPGItem {
  start: string;
  stop: string;
  title: string;
  description: string;
  categories: string[];
}

const EPGComponent = ({ server, channelId }: IEPGComponentProps) => {
  const epgQuery = useQuery({
    queryKey: [`epg_${channelId}`],
    queryFn: () => {
      if (!server) {
        throw new Error("No server selected");
      }
      return ApiService.getEPGForChannel(server, channelId);
    },
    enabled: !!server,
  });

  const parseDateTime = (dateTimeStr: string): number => {
    // Parse format: "20250915121000 +0100"
    const [dateTime] = dateTimeStr.split(" ");
    const year = parseInt(dateTime.slice(0, 4));
    const month = parseInt(dateTime.slice(4, 6)) - 1; // Month is 0-indexed
    const day = parseInt(dateTime.slice(6, 8));
    const hour = parseInt(dateTime.slice(8, 10));
    const minute = parseInt(dateTime.slice(10, 12));
    const second = parseInt(dateTime.slice(12, 14));

    return new Date(year, month, day, hour, minute, second).getTime();
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDuration = (start: number, end: number): string => {
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const getCurrentAndUpcomingShows = (epgData: unknown[]) => {
    const now = Date.now();

    // Check if the data contains raw JSON objects with start/stop strings
    const rawShows = epgData.filter((item: unknown): item is RawEPGItem => {
      return (
        typeof item === "object" &&
        item !== null &&
        "start" in item &&
        "stop" in item &&
        "title" in item &&
        typeof (item as RawEPGItem).start === "string"
      );
    });

    if (rawShows.length > 0) {
      // Handle raw JSON format
      return rawShows.filter((show) => {
        const endTime = parseDateTime(show.stop);
        return endTime > now;
      });
    }

    // If not raw format, try EPGListing format (fallback)
    return [];
  };

  const isCurrentlyPlaying = (show: RawEPGItem): boolean => {
    const now = Date.now();
    const startTime = parseDateTime(show.start);
    const endTime = parseDateTime(show.stop);

    return now >= startTime && now <= endTime;
  };

  if (epgQuery.isLoading) {
    return <div className="p-4">Loading EPG data...</div>;
  }

  if (epgQuery.error) {
    return <div className="p-4 text-red-500">Error loading EPG data</div>;
  }

  if (!epgQuery.data || epgQuery.data.length === 0) {
    return <div className="p-4">No EPG data available</div>;
  }

  const shows = getCurrentAndUpcomingShows(epgQuery.data);

  if (shows.length === 0) {
    return (
      <div className="p-4">
        <div>No upcoming shows</div>
        <div className="text-xs mt-2 text-gray-500">
          Total shows in data: {epgQuery.data.length}
        </div>
        <div className="text-xs text-gray-500">
          Current time: {new Date().toLocaleString()}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full">
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4 pr-4">
            {shows.map((show, index) => {
              const startTime = parseDateTime(show.start);
              const endTime = parseDateTime(show.stop);
              const duration = formatDuration(startTime, endTime);
              const isPlaying = isCurrentlyPlaying(show);

              return (
                <Card
                  key={index}
                  className={`flex flex-col flex-shrink-0 w-80 ${
                    isPlaying ? "ring-1 ring-primary" : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {formatTime(startTime)} - {formatTime(endTime)}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {duration}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-col flex-1">
                    <h4 className="font-semibold leading-tight mb-3">
                      {show.title}
                    </h4>

                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                      {show.description}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      {isPlaying && (
                        <Badge variant="default" className="w-fit">
                          Now Playing
                        </Badge>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-950/50 dark:border-red-800 dark:hover:bg-red-900/50 ml-auto"
                          >
                            <Icons.record className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Record</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="mt-2" />
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
};

export default EPGComponent;
